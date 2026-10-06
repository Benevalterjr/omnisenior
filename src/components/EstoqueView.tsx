'use client';

import React, { useState, useEffect } from 'react';
import { Resident, IndividualInventoryItem } from '@/types/ilpi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  AlertTriangle, 
  Search, 
  Phone, 
  AlertCircle, 
  Plus, 
  Minus,
  Sparkles
} from 'lucide-react';
import { subscribeResidentInventory, updateInventoryQuantity } from '@/lib/firebaseService';

interface EstoqueViewProps {
  residents: Resident[];
}

export function EstoqueView({ residents }: EstoqueViewProps) {
  const { canEditInventory } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyAlerts, setOnlyAlerts] = useState(false);
  const [inventoryMap, setInventoryMap] = useState<Record<string, IndividualInventoryItem[]>>({});

  useEffect(() => {
    const unsubscribes: Array<() => void> = [];

    residents.forEach((r) => {
      const unsub = subscribeResidentInventory(r.id, (items) => {
        setInventoryMap(prev => ({
          ...prev,
          [r.id]: items
        }));
      });
      unsubscribes.push(unsub);
    });

    return () => {
      unsubscribes.forEach(u => u());
    };
  }, [residents]);

  const handleStockChange = async (residentId: string, item: IndividualInventoryItem, delta: number) => {
    const newQty = Math.max(0, item.currentQuantity + delta);
    await updateInventoryQuantity(residentId, item.id, newQty);
  };

  // Flatten all items with resident info
  const allItems = residents.flatMap(resident => {
    const items = inventoryMap[resident.id] || [];
    return items.map(item => ({
      ...item,
      resident
    }));
  });

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.resident.room.includes(searchTerm);
    if (!matchesSearch) return false;

    if (onlyAlerts) {
      return item.currentQuantity <= item.minAlertQuantity;
    }

    return true;
  });

  const totalAlerts = allItems.filter(i => i.currentQuantity <= i.minAlertQuantity).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert if low stock exists */}
      {totalAlerts > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between text-amber-900 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800">Alerta de Reposição Individual</div>
              <p className="text-xs text-amber-700 font-medium">
                Existem <strong>{totalAlerts} item(ns)</strong> individuais abaixo da cota mínima de segurança (fraldas ou medicamentos). Solicite reposição aos familiares.
              </p>
            </div>
          </div>

          <button
            onClick={() => setOnlyAlerts(!onlyAlerts)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
              onlyAlerts
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
          >
            {onlyAlerts ? 'Ver Todos' : 'Filtrar Alertas'}
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por item, residente ou quarto..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <span>Total de itens monitorados: <strong>{allItems.length}</strong></span>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const isLow = item.currentQuantity <= item.minAlertQuantity;
          const primaryContact = item.resident.emergencyContacts[0];

          return (
            <div
              key={`${item.resident.id}-${item.id}`}
              className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition ${
                isLow ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200 hover:border-teal-200'
              }`}
            >
              <div>
                {/* Header: Resident & Room */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      Q.{item.resident.room}
                    </span>
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">
                      {item.resident.name}
                    </span>
                  </div>

                  {isLow ? (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span>Repor</span>
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Regular
                    </span>
                  )}
                </div>

                {/* Item Details */}
                <div className="mt-3">
                  <h4 className="text-sm font-bold text-slate-900">{item.itemName}</h4>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Estoque mínimo de alerta: <strong>{item.minAlertQuantity} {item.unit || 'un'}</strong>
                  </div>
                </div>
              </div>

              {/* Bottom Controls & Family Notification */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Quantidade Atual:</span>
                  <div className="flex items-center space-x-2">
                    {canEditInventory && (
                      <button
                        onClick={() => handleStockChange(item.resident.id, item, -1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className={`text-base font-black px-2 ${isLow ? 'text-amber-700' : 'text-slate-800'}`}>
                      {item.currentQuantity} {item.unit || 'un'}
                    </span>
                    {canEditInventory && (
                      <button
                        onClick={() => handleStockChange(item.resident.id, item, 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Contact Family Quick WhatsApp / Call */}
                {isLow && primaryContact && (
                  <a
                    href={`https://wa.me/55${primaryContact.phone.replace(/\D/g, '')}?text=Olá,%20aqui%20é%20da%20equipe%20da%20ILPI.%20Gostaríamos%20de%20solicitar%20a%20reposição%20de%20${encodeURIComponent(item.itemName)}%20para%20${encodeURIComponent(item.resident.name)}.`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold py-1.5 px-2.5 rounded-xl border border-emerald-200 flex items-center justify-center space-x-1.5 transition"
                  >
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>Avisar {primaryContact.name} ({primaryContact.phone})</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
