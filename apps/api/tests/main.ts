import { ADMIN_EMAIL, ADMIN_PASSWORD, CITIZEN_EMAIL, CITIZEN_PASSWORD } from './config';
import { testAdminFlow, testCitizenFlow, testSecurityScenarios } from './scenarios';

async function main(): Promise<void> {
  console.log('Starting API tests...');

  console.log('The admin email is:', ADMIN_EMAIL);
  console.log('The admin password is:', ADMIN_PASSWORD);
  const adminCookie = await testAdminFlow(ADMIN_EMAIL, ADMIN_PASSWORD);

  const citizenCookie = await testCitizenFlow(CITIZEN_EMAIL, CITIZEN_PASSWORD);

  await testSecurityScenarios(adminCookie, citizenCookie);
}

if (require.main === module) {
  main().catch(console.error);
}
