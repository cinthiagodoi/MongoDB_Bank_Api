import express from "express";
import { AccountsController } from "../controllers/accountsController.js";

const router = express.Router();
const accountsController = new AccountsController();

router.patch("/deposit", accountsController.deposit);
router.patch("/withdraw", accountsController.withdraw);
router.patch("/transfer", accountsController.transfer);
router.patch("/privateAgency", accountsController.privateAgency);

router.get("/findBalance", accountsController.consultBalance);
router.get("/average", accountsController.average);
router.get("/lowestValues", accountsController.lowestValues);
router.get("/biggerValues", accountsController.biggerValues);

router.delete("/delete", accountsController.deleteAccount);
export default router;
