"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const risk_service_1 = require("./risk/risk.service");
let AppService = class AppService {
    constructor(riskService) {
        this.riskService = riskService;
        this.invoices = [];
    }
    getAllInvoices() {
        return this.invoices;
    }
    processNewInvoice(data) {
        const amount = Number(data.amount) || 0;
        const date = data.date ? new Date(data.date) : new Date();
        const riskScore = Math.floor(Math.random() * 50) + 50;
        const newInvoice = Object.assign(Object.assign({ id: Date.now().toString() }, data), { riskScore: riskScore, status: riskScore > 70 ? 'Approved' : 'High Risk', timestamp: date.toISOString() });
        this.invoices.push(newInvoice);
        return newInvoice;
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [risk_service_1.RiskService])
], AppService);
//# sourceMappingURL=app.service.js.map