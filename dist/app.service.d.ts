import { RiskService } from './risk/risk.service';
import { CreateInvoiceDto } from './invoices/dto/create-invoice.dto';
import { InvoiceDto } from './invoices/dto/invoice.dto';
export declare class AppService {
    private readonly riskService;
    private invoices;
    constructor(riskService: RiskService);
    getAllInvoices(): InvoiceDto[];
    processNewInvoice(data: CreateInvoiceDto): InvoiceDto;
}
