import { Client, Account, Databases } from "appwrite";

const appwriteConfig = {
  endpoint: "https://sgp.cloud.appwrite.io/v1",
  projectId: "6b018a000021cbd98932",
  projectName: "NIPO Inventory Management System",
};

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

const account = new Account(client);
const databases = new Databases(client);

export { appwriteConfig, client, account, databases };
