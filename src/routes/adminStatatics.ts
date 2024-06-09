import express from 'express';
import { adminDashboardStats, barChartStats, lineChartStats, productChart } from '../controller/adminStatatics';
const app = express.Router();


// route -->/api/v1/admin/dashboard
app.get("/dashboard",adminDashboardStats);
app.get("/product/pieChart",productChart);
app.get("/barChart",barChartStats);
app.get("/lineChart",lineChartStats);


export default app;