import {db} from '@/client';
import {truck} from '@/schema';

async function seed() {
  console.log('Añadiendo datos de prueba a la tabla de camiones...');

  await db.insert(truck).values([
    {id: 'truck-1', name: 'R-LIMA-CENTRO', licensePlate: 'ABC-123'},
    {id: 'truck-2', name: 'R-LIMA-NORTE', licensePlate: 'XYZ-789'},
    {id: 'truck-3', name: 'R-LIMA-SUR', licensePlate: 'LMN-456'},
  ]);

  console.log("Datos de prueba añadidos a la tabla de camiones. Revisa la tabla 'trucks' en la instancia en Supabase.");
  process.exit(0);
}

seed().catch(error => {
  console.error('Error al añadir datos de prueba:', error);
  process.exit(1);
});
