import Dexie, { type Table } from 'dexie';



export interface HiveFrame {
    id: string;
    boxId: string;
    hiveId: string; // Redundant but useful for "get all frames in hive"
    position: number;
    content: 'honey' | 'brood' | 'foundation' | 'empty';
}

export interface HiveBox {
    id: string;
    hiveId: string;
    type: 'deep' | 'medium';
    position: number; // Order in the stack (0 = bottom)
    capacity: number; // Max frames (e.g., 8, 10, 12)
}

export interface Hive {
    id: string; // UUID
    number: string;
    type: string; // e.g., Dadant
    status: 'active' | 'archived';
    queenYear: number;
    breed: string;
    color: string;
    notes?: string; // General persistent notes
}

export interface Inspection {
    id: string; // UUID
    hiveId: string;
    date: string; // ISO string
    type: 'clinical' | 'config_change' | 'general';
    queenSeen: boolean;
    framesOfBrood: number;
    honeyStores: 'low' | 'med' | 'high';
    temperament: number; // 1-5
    notes: string;
}

export interface Harvest {
    id: string; // UUID
    hiveId: string;
    date: string;
    weightKg: number;
    honeyType: string;
}

export interface Treatment {
    id: string; // UUID
    hiveId: string;
    medicineName: string;
    dateStart: string;
    dateEnd?: string;
    dosage: string;
}

export class BeekeepingDB extends Dexie {
    hives!: Table<Hive>;
    boxes!: Table<HiveBox>;
    frames!: Table<HiveFrame>;
    inspections!: Table<Inspection>;
    harvests!: Table<Harvest>;
    treatments!: Table<Treatment>;

    constructor() {
        super('BeekeepingDB');

        // Version 1 (Original)
        this.version(1).stores({
            hives: 'id, number',
            inspections: 'id, hiveId, date',
            harvests: 'id, hiveId, date',
            treatments: 'id, hiveId, dateStart'
        });

        // Version 2 (Relational Boxes/Frames)
        this.version(2).stores({
            hives: 'id, number',
            boxes: 'id, hiveId, [hiveId+position]', // Compound index for ordering
            frames: 'id, boxId, hiveId, [boxId+position]',
            inspections: 'id, hiveId, date',
            harvests: 'id, hiveId, date',
            treatments: 'id, hiveId, dateStart'
        });

        // Version 3 (Inspections & Notes)
        this.version(3).stores({
            hives: 'id, number',
            boxes: 'id, hiveId, [hiveId+position]',
            frames: 'id, boxId, hiveId, [boxId+position]',
            inspections: 'id, hiveId, date, type', // Added type index
            harvests: 'id, hiveId, date',
            treatments: 'id, hiveId, dateStart'
        });
    }
}

export const db = new BeekeepingDB();
