import db from '../../src/schemas';
import { User } from '../../src/schemas/users';

const list = [
  {
    name: 'Usuário admin',
    role: 'admin',
    cpf: '00000000000',
    email: 'admin@login.com',
    password: 'admin',
    active: true
  },
  {
    name: 'Usuário gerente (estabelecimento)',
    role: 'manager',
    cpf: '00000000001',
    email: 'manager@login.com',
    password: 'manager',
    active: true
  },
  {
    name: 'Usuário financeiro (estabelecimento)',
    role: 'financial',
    cpf: '00000000002',
    email: 'financial@login.com',
    password: 'financial',
    active: true
  },
  {
    name: 'Usuário atendente (estabelecimento)',
    role: 'operator',
    cpf: '00000000003',
    email: 'operator@login.com',
    password: 'operator',
    active: true
  }
] as User[];

/**
 * Seed the users table
 */
const seed = async () => {
  const alreadyCreated = await db.users.findAll();
  if (alreadyCreated.length < list.length) {
    const placeStores = await db.placeStores.findAll();
    const itemsToCreate = list
      .map((item) => {
        const created = alreadyCreated.find((dbItem) => dbItem.cpf === item.cpf);
        if (created) return null; // Item is already created, don't create it again
        const store = placeStores[0];
        const user = { ...item, cityId: store.cityId };
        if (user.role !== 'admin') {
          user.placeStoreId = store.id;
        }
        console.log(`[seed] Users: New entry will be created with data:`);
        console.log(`       Role -      ${user.role}`);
        console.log(`       Email -     ${user.email}`);
        console.log(`       Password -  ${user.password}`);
        return user;
      })
      .filter(Boolean) as User[];
    if (itemsToCreate.length > 0) {
      await db.users.bulkCreate(itemsToCreate, { individualHooks: true });
    }
    console.log(`[seed] Users: Seeded successfully - ${itemsToCreate.length} new created`);
  } else {
    console.log(`[seed] Users: Nothing to seed`);
  }
};

export default { seed };
