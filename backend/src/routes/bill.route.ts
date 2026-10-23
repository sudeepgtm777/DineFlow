// @ts-nocheck
import express from "express";
import  {getBillDetails}  from "../controllers/bill.controller";

const router = express.Router();


router.get("/table/:tableNumber", getBillDetails);

export default router;
