import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateInvoiceDto } from './invoices/dto/create-invoice.dto';
import { InvoiceDto } from './invoices/dto/invoice.dto';

@ApiTags('Invoices')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('invoices')
  @ApiOperation({ summary: 'Retrieve all invoices', description: 'Returns a list of all processed invoices' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of invoices retrieved successfully.', 
    type: [InvoiceDto] 
  })
  getInvoices(): InvoiceDto[] {
    return this.appService.getAllInvoices();
  }

  @Post('invoices')
  @ApiOperation({ summary: 'Create a new invoice', description: 'Submits a new invoice for risk assessment and processing' })
  @ApiBody({ type: CreateInvoiceDto, description: 'Invoice details' })
  @ApiResponse({ 
    status: 201, 
    description: 'Invoice created and processed successfully.', 
    type: InvoiceDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  createInvoice(@Body() createInvoiceDto: CreateInvoiceDto): InvoiceDto {
    return this.appService.processNewInvoice(createInvoiceDto);
  }

  @Get('test-error')
  @ApiOperation({ summary: 'Test error handling', description: 'Deliberately throws an error to test global error handling' })
  @ApiResponse({ status: 500, description: 'Error handled by global exception filter' })
  testError(): never {
    throw new Error('This is a test error to verify global error handling works correctly');
  }

  @Get('ping')
  @ApiOperation({ summary: 'Ping the server', description: 'Simple endpoint to check if the server is up' })
  @ApiResponse({ status: 200, description: 'Server is up' })
  ping(): string {
    return 'pong';
  }
}
