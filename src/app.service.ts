import { Injectable } from '@nestjs/common';
import { RiskService } from './risk/risk.service';
import { CreateInvoiceDto } from './invoices/dto/create-invoice.dto';
import { InvoiceDto } from './invoices/dto/invoice.dto';

/**
 * Main application service handling core business logic for invoices and general tasks.
 */
@Injectable()
export class AppService {
  /**
   * In-memory store for invoices.
   * @private
   */
  private invoices: InvoiceDto[] = [];

  constructor(private readonly riskService: RiskService) {}

  /**
   * Retrieves all processed invoices from the in-memory store.
   * 
   * @returns An array of InvoiceDto objects.
   */
  getAllInvoices(): InvoiceDto[] {
    return this.invoices;
  }

  /**
   * Processes a new invoice by calculating its risk score and status.
   * 
   * @param data - The data required to create a new invoice.
   * @returns The newly created and processed InvoiceDto.
   */
  processNewInvoice(data: CreateInvoiceDto): InvoiceDto {
    const amount = Number(data.amount) || 0;
    const date = data.date ? new Date(data.date) : new Date();

    // Mock Risk Logic: Random Score 50-99
    const riskScore = Math.floor(Math.random() * 50) + 50; 
    
    const newInvoice: InvoiceDto = {
      id: Date.now().toString(),
      ...data,
      riskScore: riskScore,
      status: riskScore > 70 ? 'Approved' : 'High Risk',
      timestamp: date.toISOString()
    };

    this.invoices.push(newInvoice);
    return newInvoice;
  }
}
