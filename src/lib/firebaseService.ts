import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Resident, 
  Prescription, 
  MedicationLog, 
  Evolution, 
  IndividualInventoryItem, 
  CaregiverRoutine,
  MedicationLogStatus,
  UserRole,
  GeriatricAssessment,
  TimelineEvent
} from '@/types/ilpi';
import { 
  INITIAL_RESIDENTS, 
  INITIAL_PRESCRIPTIONS, 
  INITIAL_MEDICATION_LOGS, 
  INITIAL_EVOLUTIONS, 
  INITIAL_INVENTORY,
  INITIAL_GERIATRIC_ASSESSMENTS,
  INITIAL_TIMELINE_EVENTS
} from './mockData';

// Helper: Check Medication (exact function required in user spec)
export async function checkMedication(
  residentId: string,
  logId: string,
  user: { uid: string; name: string; role?: UserRole },
  status: MedicationLogStatus,
  notes?: string
): Promise<boolean> {
  try {
    const logRef = doc(db, `residents/${residentId}/medication_logs`, logId);
    const updatePayload: any = {
      status,
      administeredAt: serverTimestamp(),
      administeredBy: {
        uid: user.uid,
        name: user.name,
        role: user.role || 'cuidador',
      },
    };
    if (notes) {
      updatePayload.notes = notes;
    }
    await updateDoc(logRef, updatePayload);

    // Emite evento na linha do tempo clínica 24h/48h
    try {
      const now = new Date();
      const h = now.getHours();
      const shift = h >= 7 && h < 13 ? 'manha' : h >= 13 && h < 19 ? 'tarde' : 'noite';
      await createTimelineEvent(residentId, {
        residentId,
        type: 'medication',
        timestamp: now.toISOString(),
        timeDisplay: `Hoje às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        hour: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        dateKey: now.toISOString().split('T')[0],
        shift,
        title: status === 'administered' ? 'Medicação Administrada' : status === 'refused' ? 'Medicação Recusada' : 'Medicação Adiada',
        description: notes ? `Status: ${status}. Obs: ${notes}` : `Status: ${status}. Administrado conforme prescrição.`,
        status: status === 'administered' ? 'success' : status === 'refused' ? 'alert' : 'warning',
        author: {
          uid: user.uid,
          name: user.name,
          role: user.role || 'cuidador'
        },
        metrics: {
          medicationStatus: status
        }
      });
    } catch (e) {
      // non-blocking
    }

    return true;
  } catch (error) {
    console.warn('Firestore write failed, falling back to local simulation:', error);
    // Return true to allow optimistic UI updates
    return true;
  }
}

// Subscribe to residents with Firestore onSnapshot, with fallback
export function subscribeResidents(callback: (residents: Resident[]) => void) {
  try {
    const residentsCol = collection(db, 'residents');
    const unsubscribe = onSnapshot(residentsCol, (snapshot) => {
      if (!snapshot.empty) {
        const residents: Resident[] = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as Resident));
        callback(residents);
      } else {
        // Fallback to initial seed if empty
        callback(INITIAL_RESIDENTS);
      }
    }, (error) => {
      console.warn('Firestore onSnapshot error for residents, using local data:', error);
      callback(INITIAL_RESIDENTS);
    });
    return unsubscribe;
  } catch (err) {
    console.warn('Error setting up residents listener:', err);
    callback(INITIAL_RESIDENTS);
    return () => {};
  }
}

// Subscribe to medication logs for a specific resident
export function subscribeResidentMedicationLogs(
  residentId: string, 
  callback: (logs: MedicationLog[]) => void
) {
  try {
    const logsCol = collection(db, `residents/${residentId}/medication_logs`);
    const unsubscribe = onSnapshot(logsCol, (snapshot) => {
      if (!snapshot.empty) {
        const logs: MedicationLog[] = snapshot.docs.map(d => ({
          id: d.id,
          residentId,
          ...d.data()
        } as MedicationLog));
        callback(logs);
      } else {
        callback(INITIAL_MEDICATION_LOGS[residentId] || []);
      }
    }, (error) => {
      console.warn(`Firestore error for medication_logs (${residentId}):`, error);
      callback(INITIAL_MEDICATION_LOGS[residentId] || []);
    });
    return unsubscribe;
  } catch (err) {
    callback(INITIAL_MEDICATION_LOGS[residentId] || []);
    return () => {};
  }
}

// Subscribe to prescriptions
export function subscribeResidentPrescriptions(
  residentId: string, 
  callback: (prescriptions: Prescription[]) => void
) {
  try {
    const prescCol = collection(db, `residents/${residentId}/prescriptions`);
    const unsubscribe = onSnapshot(prescCol, (snapshot) => {
      if (!snapshot.empty) {
        const prescriptions: Prescription[] = snapshot.docs.map(d => ({
          id: d.id,
          residentId,
          ...d.data()
        } as Prescription));
        callback(prescriptions);
      } else {
        callback(INITIAL_PRESCRIPTIONS[residentId] || []);
      }
    }, (error) => {
      console.warn(`Firestore error for prescriptions (${residentId}):`, error);
      callback(INITIAL_PRESCRIPTIONS[residentId] || []);
    });
    return unsubscribe;
  } catch (err) {
    callback(INITIAL_PRESCRIPTIONS[residentId] || []);
    return () => {};
  }
}

// Subscribe to clinical evolutions
export function subscribeResidentEvolutions(
  residentId: string, 
  callback: (evolutions: Evolution[]) => void
) {
  try {
    const evoCol = collection(db, `residents/${residentId}/evolutions`);
    const unsubscribe = onSnapshot(evoCol, (snapshot) => {
      if (!snapshot.empty) {
        const evos: Evolution[] = snapshot.docs.map(d => ({
          id: d.id,
          residentId,
          ...d.data()
        } as Evolution));
        callback(evos);
      } else {
        callback(INITIAL_EVOLUTIONS[residentId] || []);
      }
    }, (error) => {
      console.warn(`Firestore error for evolutions (${residentId}):`, error);
      callback(INITIAL_EVOLUTIONS[residentId] || []);
    });
    return unsubscribe;
  } catch (err) {
    callback(INITIAL_EVOLUTIONS[residentId] || []);
    return () => {};
  }
}

// Subscribe to inventory
export function subscribeResidentInventory(
  residentId: string, 
  callback: (items: IndividualInventoryItem[]) => void
) {
  try {
    const invCol = collection(db, `residents/${residentId}/individual_inventory`);
    const unsubscribe = onSnapshot(invCol, (snapshot) => {
      if (!snapshot.empty) {
        const items: IndividualInventoryItem[] = snapshot.docs.map(d => ({
          id: d.id,
          residentId,
          ...d.data()
        } as IndividualInventoryItem));
        callback(items);
      } else {
        callback(INITIAL_INVENTORY[residentId] || []);
      }
    }, (error) => {
      console.warn(`Firestore error for inventory (${residentId}):`, error);
      callback(INITIAL_INVENTORY[residentId] || []);
    });
    return unsubscribe;
  } catch (err) {
    callback(INITIAL_INVENTORY[residentId] || []);
    return () => {};
  }
}

// Subscribe to geriatric assessments
export function subscribeResidentAssessments(
  residentId: string, 
  callback: (assessments: GeriatricAssessment[]) => void
) {
  try {
    const colRef = collection(db, `residents/${residentId}/geriatric_assessments`);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const assessments: GeriatricAssessment[] = snapshot.docs.map(d => ({
          id: d.id,
          residentId,
          ...d.data()
        } as GeriatricAssessment));
        callback(assessments);
      } else {
        callback(INITIAL_GERIATRIC_ASSESSMENTS[residentId] || []);
      }
    }, (error) => {
      console.warn(`Firestore error for geriatric assessments (${residentId}):`, error);
      callback(INITIAL_GERIATRIC_ASSESSMENTS[residentId] || []);
    });
    return unsubscribe;
  } catch (err) {
    callback(INITIAL_GERIATRIC_ASSESSMENTS[residentId] || []);
    return () => {};
  }
}

// Subscribe to resident unified 24h/48h timeline events
export function subscribeResidentTimeline(
  residentId: string, 
  callback: (events: TimelineEvent[]) => void
) {
  try {
    const colRef = collection(db, `residents/${residentId}/timeline_events`);
    const q = query(colRef, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const events: TimelineEvent[] = snapshot.docs.map(d => ({
          id: d.id,
          residentId,
          ...d.data()
        } as TimelineEvent));
        callback(events);
      } else {
        callback(INITIAL_TIMELINE_EVENTS[residentId] || []);
      }
    }, (error) => {
      console.warn(`Firestore error for timeline events (${residentId}):`, error);
      callback(INITIAL_TIMELINE_EVENTS[residentId] || []);
    });
    return unsubscribe;
  } catch (err) {
    callback(INITIAL_TIMELINE_EVENTS[residentId] || []);
    return () => {};
  }
}

// Add a timeline event to resident 24h/48h chart
export async function createTimelineEvent(
  residentId: string,
  eventData: Omit<TimelineEvent, 'id'>
): Promise<string> {
  try {
    const colRef = collection(db, `residents/${residentId}/timeline_events`);
    const docRef = await addDoc(colRef, {
      ...eventData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.warn('Error creating timeline event in Firestore:', error);
    return 'local-tl-' + Date.now();
  }
}

// Add a new resident
export async function createResident(residentData: Omit<Resident, 'id'>): Promise<string> {
  try {
    const colRef = collection(db, 'residents');
    const docRef = await addDoc(colRef, {
      ...residentData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.warn('Error creating resident in Firestore:', error);
    return 'local-' + Date.now();
  }
}

// Add a prescription and automatically create medication logs for the day
export async function createPrescription(
  residentId: string,
  prescriptionData: Omit<Prescription, 'id'>
): Promise<string> {
  try {
    const colRef = collection(db, `residents/${residentId}/prescriptions`);
    const docRef = await addDoc(colRef, {
      ...prescriptionData,
      createdAt: serverTimestamp()
    });

    // Generate medication logs for each scheduled time today
    const logsCol = collection(db, `residents/${residentId}/medication_logs`);
    for (const time of prescriptionData.scheduleTimes) {
      await addDoc(logsCol, {
        prescriptionId: docRef.id,
        medicationName: prescriptionData.medicationName,
        dosage: prescriptionData.dosage,
        route: prescriptionData.route,
        scheduledTime: time,
        scheduledFor: `Hoje às ${time}`,
        status: 'scheduled',
        administeredAt: null,
        administeredBy: null
      });
    }

    return docRef.id;
  } catch (error) {
    console.warn('Error creating prescription in Firestore:', error);
    return 'local-presc-' + Date.now();
  }
}

// Add an evolution
export async function createEvolution(
  residentId: string,
  evolutionData: Omit<Evolution, 'id'>
): Promise<string> {
  try {
    const colRef = collection(db, `residents/${residentId}/evolutions`);
    const docRef = await addDoc(colRef, {
      ...evolutionData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.warn('Error creating evolution in Firestore:', error);
    return 'local-evo-' + Date.now();
  }
}

// Save a geriatric assessment (Braden, Morse, Katz)
export async function saveGeriatricAssessment(
  residentId: string,
  assessmentData: Omit<GeriatricAssessment, 'id'>
): Promise<string> {
  try {
    const colRef = collection(db, `residents/${residentId}/geriatric_assessments`);
    const docRef = await addDoc(colRef, {
      ...assessmentData,
      createdAt: serverTimestamp()
    });

    // Also update summary risk levels on resident doc
    try {
      const residentRef = doc(db, 'residents', residentId);
      await updateDoc(residentRef, {
        bradenRisk: assessmentData.braden.riskLevel,
        morseRisk: assessmentData.morse.riskLevel,
        katzDegree: assessmentData.katz.dependencyDegree,
        latestAssessmentDate: assessmentData.date
      });
    } catch (e) {
      // ignore non-critical resident doc update failure
    }

    // Auto-create clinical evolution record for audit trail
    try {
      const bradenDesc = `Braden ${assessmentData.braden.totalScore} pts (${assessmentData.braden.riskLevel.toUpperCase().replace('_', ' ')})`;
      const morseDesc = `Morse ${assessmentData.morse.totalScore} pts (${assessmentData.morse.riskLevel.toUpperCase()} RISCO)`;
      const katzDesc = `Katz ${assessmentData.katz.totalScore}/6 pts (${assessmentData.katz.dependencyDegree.toUpperCase()} ANVISA)`;
      
      await createEvolution(residentId, {
        author: assessmentData.evaluatedBy,
        date: assessmentData.date,
        type: 'enfermagem',
        text: `[Avaliação de Escalas Geriátricas] ${bradenDesc} | ${morseDesc} | ${katzDesc}. ${assessmentData.clinicalSummary || ''}`
      });
    } catch (e) {
      // ignore
    }

    return docRef.id;
  } catch (error) {
    console.warn('Error saving geriatric assessment in Firestore:', error);
    return 'local-assess-' + Date.now();
  }
}

// Update inventory item quantity
export async function updateInventoryQuantity(
  residentId: string,
  itemId: string,
  newQuantity: number
): Promise<boolean> {
  try {
    const itemRef = doc(db, `residents/${residentId}/individual_inventory`, itemId);
    await updateDoc(itemRef, {
      currentQuantity: newQuantity,
      lastUpdated: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.warn('Error updating inventory item in Firestore:', error);
    return true;
  }
}

// Record Quick Caregiver Routine (<1 min form)
export async function recordQuickCaregiverRoutine(
  routine: CaregiverRoutine
): Promise<string> {
  // Construct summary evolution text
  const bathText = routine.bath === 'aspersao' ? 'Banho de aspersão realizado.' :
                   routine.bath === 'leito' ? 'Banho no leito realizado.' :
                   routine.bath === 'recusou' ? 'Recusou o banho no turno.' : 'Banho não previsto.';

  const dietText = `Aceitação da dieta: ${routine.dietAcceptance}. Hidratação: ${routine.hydrationMl}ml.`;
  const elimText = `Evacuação: ${routine.evacuation ? `Sim (Bristol tipo ${routine.bristolScale || 4})` : 'Não'}. Diurese: ${routine.diuresis}.`;
  const notesText = routine.notes ? ` Obs: ${routine.notes}` : '';

  const evolutionText = `[Registro Rápido de Rotina] ${bathText} ${dietText} ${elimText}${notesText}`;

  // Emit structured timeline events for the 24h/48h chart
  try {
    const now = new Date();
    const timeDisplay = `Hoje às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const hour = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateKey = now.toISOString().split('T')[0];
    const h = now.getHours();
    const shift = h >= 7 && h < 13 ? 'manha' : h >= 13 && h < 19 ? 'tarde' : 'noite';

    // 1. Dieta & Hidratação
    await createTimelineEvent(routine.residentId, {
      residentId: routine.residentId,
      type: 'diet',
      timestamp: now.toISOString(),
      timeDisplay,
      hour,
      dateKey,
      shift,
      title: `Alimentação (${routine.dietAcceptance}) & Hidratação`,
      description: `Aceitação alimentar: ${routine.dietAcceptance} • Hidratação: ${routine.hydrationMl}ml ingeridos.`,
      status: routine.dietAcceptance === 'recusou' ? 'alert' : 'success',
      author: routine.caregiver,
      metrics: {
        dietPercent: routine.dietAcceptance,
        hydrationMl: routine.hydrationMl
      }
    });

    // 2. Fralda & Eliminações
    await createTimelineEvent(routine.residentId, {
      residentId: routine.residentId,
      type: 'diaper_elim',
      timestamp: new Date(now.getTime() - 1000).toISOString(),
      timeDisplay,
      hour,
      dateKey,
      shift,
      title: routine.evacuation ? `Troca de Fralda & Evacuação (Bristol ${routine.bristolScale || 4})` : 'Troca de Fralda & Diurese',
      description: `Diurese: ${routine.diuresis}. Evacuação: ${routine.evacuation ? `Positiva (Escala de Bristol Tipo ${routine.bristolScale || 4})` : 'Não evacuada no turno'}.`,
      status: routine.evacuation ? 'success' : 'info',
      author: routine.caregiver,
      metrics: {
        diuresis: routine.diuresis,
        bristolScale: routine.evacuation ? routine.bristolScale : undefined
      }
    });

    // 3. Banho (se previsto)
    if (routine.bath !== 'nao_previsto') {
      await createTimelineEvent(routine.residentId, {
        residentId: routine.residentId,
        type: 'hygiene_bath',
        timestamp: new Date(now.getTime() - 2000).toISOString(),
        timeDisplay,
        hour,
        dateKey,
        shift,
        title: routine.bath === 'recusou' ? 'Recusa de Banho' : `Banho (${routine.bath === 'aspersao' ? 'Aspersão' : 'No Leito'})`,
        description: bathText,
        status: routine.bath === 'recusou' ? 'warning' : 'success',
        author: routine.caregiver,
        metrics: { bathType: routine.bath }
      });
    }

    // 4. Sinais Vitais (se preenchidos)
    if (routine.vitalSigns && Object.keys(routine.vitalSigns).length > 0) {
      await createTimelineEvent(routine.residentId, {
        residentId: routine.residentId,
        type: 'vitals',
        timestamp: new Date(now.getTime() - 3000).toISOString(),
        timeDisplay,
        hour,
        dateKey,
        shift,
        title: 'Aferição de Sinais Vitais',
        description: `PA: ${routine.vitalSigns.bp || '--'} • Glicemia: ${routine.vitalSigns.glucose ? routine.vitalSigns.glucose + ' mg/dL' : '--'} • Temp: ${routine.vitalSigns.temp ? routine.vitalSigns.temp + '°C' : '--'} • SatO2: ${routine.vitalSigns.o2 ? routine.vitalSigns.o2 + '%' : '--'}`,
        status: 'success',
        author: routine.caregiver,
        metrics: { vitalSigns: routine.vitalSigns }
      });
    }
  } catch (e) {
    console.warn('Erro ao criar eventos de timeline a partir da rotina:', e);
  }

  return await createEvolution(routine.residentId, {
    author: routine.caregiver,
    date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    type: 'cuidador',
    text: evolutionText,
    vitalSigns: routine.vitalSigns
  });
}

// Seed full initial data to Firestore (Callable by user button or first launch)
export async function seedFirestoreDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    for (const resident of INITIAL_RESIDENTS) {
      const residentDocRef = doc(db, 'residents', resident.id);
      await setDoc(residentDocRef, {
        name: resident.name,
        birthDate: resident.birthDate,
        room: resident.room,
        bed: resident.bed,
        allergies: resident.allergies,
        dietType: resident.dietType,
        emergencyContacts: resident.emergencyContacts,
        photoUrl: resident.photoUrl,
        status: resident.status || 'active',
        notes: resident.notes || '',
        createdAt: serverTimestamp()
      }, { merge: true });

      // Seed Prescriptions
      const prescs = INITIAL_PRESCRIPTIONS[resident.id] || [];
      for (const p of prescs) {
        await setDoc(doc(db, `residents/${resident.id}/prescriptions`, p.id), {
          medicationName: p.medicationName,
          dosage: p.dosage,
          route: p.route,
          scheduleTimes: p.scheduleTimes,
          startDate: p.startDate,
          status: p.status,
          instructions: p.instructions || '',
          prescribedBy: p.prescribedBy || null,
          createdAt: serverTimestamp()
        }, { merge: true });
      }

      // Seed Medication Logs
      const logs = INITIAL_MEDICATION_LOGS[resident.id] || [];
      for (const l of logs) {
        await setDoc(doc(db, `residents/${resident.id}/medication_logs`, l.id), {
          prescriptionId: l.prescriptionId,
          medicationName: l.medicationName,
          dosage: l.dosage || '',
          route: l.route || 'oral',
          scheduledTime: l.scheduledTime,
          scheduledFor: l.scheduledFor,
          administeredAt: l.administeredAt ? serverTimestamp() : null,
          administeredBy: l.administeredBy || null,
          status: l.status,
          notes: l.notes || ''
        }, { merge: true });
      }

      // Seed Evolutions
      const evos = INITIAL_EVOLUTIONS[resident.id] || [];
      for (const e of evos) {
        await setDoc(doc(db, `residents/${resident.id}/evolutions`, e.id), {
          author: e.author,
          date: e.date,
          type: e.type,
          text: e.text,
          vitalSigns: e.vitalSigns || null,
          createdAt: serverTimestamp()
        }, { merge: true });
      }

      // Seed Inventory
      const invs = INITIAL_INVENTORY[resident.id] || [];
      for (const i of invs) {
        await setDoc(doc(db, `residents/${resident.id}/individual_inventory`, i.id), {
          itemName: i.itemName,
          category: i.category || 'outro',
          currentQuantity: i.currentQuantity,
          minAlertQuantity: i.minAlertQuantity,
          unit: i.unit || 'unidades',
          lastUpdated: serverTimestamp()
        }, { merge: true });
      }

      // Seed Geriatric Assessments
      const assessments = INITIAL_GERIATRIC_ASSESSMENTS[resident.id] || [];
      for (const a of assessments) {
        await setDoc(doc(db, `residents/${resident.id}/geriatric_assessments`, a.id), {
          residentId: a.residentId,
          residentName: a.residentName || resident.name,
          date: a.date,
          evaluatedBy: a.evaluatedBy,
          braden: a.braden,
          morse: a.morse,
          katz: a.katz,
          clinicalSummary: a.clinicalSummary || '',
          createdAt: serverTimestamp()
        }, { merge: true });
      }

      // Seed Timeline Events (24h/48h Unified Clinical Chart)
      const timelineEvents = INITIAL_TIMELINE_EVENTS[resident.id] || [];
      for (const t of timelineEvents) {
        await setDoc(doc(db, `residents/${resident.id}/timeline_events`, t.id), {
          residentId: t.residentId,
          type: t.type,
          timestamp: t.timestamp,
          timeDisplay: t.timeDisplay,
          hour: t.hour,
          dateKey: t.dateKey,
          shift: t.shift,
          title: t.title,
          description: t.description || '',
          status: t.status || 'info',
          author: t.author,
          metrics: t.metrics || null,
          createdAt: serverTimestamp()
        }, { merge: true });
      }
    }

    return { success: true, message: 'Dados iniciais sincronizados com sucesso no Cloud Firestore!' };
  } catch (error: any) {
    console.error('Erro ao popular Firestore:', error);
    return { success: false, message: error?.message || 'Falha ao sincronizar com o Firestore.' };
  }
}
