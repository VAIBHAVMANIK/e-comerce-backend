import express from 'express';
import { adminDashboardStats } from '../controller/adminStatatics';
const app = express.Router();


// route -->/api/v1/admin/dashboard
app.get("/dashboard",adminDashboardStats);


export default app;