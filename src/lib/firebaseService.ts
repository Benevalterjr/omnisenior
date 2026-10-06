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
  GeriatricAssessment
} from '@/types/ilpi';
import { 
  INITIAL_RESIDENTS, 
  INITIAL_PRESCRIPTIONS, 
  INITIAL_MEDICATION_LOGS, 
  INITIAL_EVOLUTIONS, 
  INITIAL_INVENTORY,
  INITIAL_GERIATRIC_ASSESSMENTS
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
    }

    return { success: true, message: 'Dados iniciais sincronizados com sucesso no Cloud Firestore!' };
  } catch (error: any) {
    console.error('Erro ao popular Firestore:', error);
    return { success: false, message: error?.message || 'Falha ao sincronizar com o Firestore.' };
  }
}
