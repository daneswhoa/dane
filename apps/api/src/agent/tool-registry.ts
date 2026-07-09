import { ExcelParserTool } from './tools/excel-parser.tool';
import { CreatePropertyTool } from './tools/create-property.tool';
import { PropertySetupTool } from './tools/property-setup.tool';
import { AddTenantTool } from './tools/add-tenant.tool';
import { AddInvoiceTool } from './tools/add-invoice.tool';
import { TicketManagerTool } from './tools/ticket-manager.tool';
import { ContractorMarketplaceTool } from './tools/contractor-marketplace.tool';
import { DispatchEngineTool } from './tools/dispatch-engine.tool';
import { GetTenantInvoicesTool } from './tools/get-tenant-invoices.tool';
import { ManageInvoiceTool } from './tools/manage-invoice.tool';
import { SyndicationTool } from './tools/syndication.tool';
import { GetOrganizationInfoTool } from './tools/get-organization-info.tool';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: any;
  execute(args: any, context?: any): Promise<any> | any;
}

export const toolsRegistry: ToolDefinition[] = [
  {
    name: 'parse_and_visualize_excel',
    description: 'Parses an Excel spreadsheet (via base64-encoded string or a file path) to extract sheets, columns, row counts, sample data rows, and auto-visualization metrics.',
    parameters: {
      type: 'object',
      properties: {
        base64Data: { type: 'string', description: 'The base64-encoded raw binary data of the Excel file.' },
        filePath: { type: 'string', description: 'The relative or absolute file path of the spreadsheet on the local disk.' },
        fileName: { type: 'string', description: 'Optional name of the spreadsheet file (e.g. data.xlsx).' }
      }
    },
    execute: (args: any) => {
      return ExcelParserTool.execute(args);
    }
  },
  {
    name: 'createBarebonesProperty',
    description: 'Creates a pending, barebones property profile in the database. Defaults address to "Address not specified" and units to 1 if not provided.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'The name of the property (e.g. Oakridge Manor).' },
        type: { type: 'string', enum: ['house', 'apartment'], description: 'Whether the property is a single house or a multi-unit apartment building.' },
        address: { type: 'string', description: 'Optional street location or full address of the property.' },
        unitsCount: { type: 'number', description: 'Optional number of units (only relevant if type is apartment).' },
        photoUrl: { type: 'string', description: 'Optional URL of the uploaded property photo.' }
      },
      required: ['name', 'type']
    },
    execute: (args: any, context: any) => {
      return CreatePropertyTool.execute(args, context);
    }
  },
  {
    name: 'getPropertiesSetupStatus',
    description: 'Inspects all properties in the owner portfolio to check if they are set up (status active vs pending), showing their name, location/address, photo, unitsCount, settings, and full details of their associated units.',
    parameters: {
      type: 'object',
      properties: {}
    },
    execute: (args: any, context: any) => {
      return PropertySetupTool.getPropertiesSetupStatus(args, context);
    }
  },
  {
    name: 'setupOrUpdatePropertyAndUnits',
    description: 'Configures or edits details of a property and its units. Allows updating property name, address, photoUrl, unitsCount (converting between single-unit and multi-unit), property settings (due date, late fees), and configuring rent, deposit, recurring fee list, and move-in fee list for units.',
    parameters: {
      type: 'object',
      properties: {
        propertyId: { type: 'string', description: 'The ID of the property to edit or setup.' },
        name: { type: 'string', description: 'Optional updated name of the property.' },
        address: { type: 'string', description: 'Optional updated address of the property.' },
        photoUrl: { type: 'string', description: 'Optional updated photo URL of the property.' },
        unitsCount: { type: 'number', description: 'Optional new number of units. E.g. setting to 1 configures it as a single house; setting to more than 1 turns it into a multi-unit property.' },
        namingConvention: { type: 'string', description: 'Optional naming convention for generating multi-unit labels & floors, e.g. "A1-A10, B1-B10" or "101-110, 201-210".' },
        settings: {
          type: 'object',
          description: 'Optional property-level configuration settings, like dueDate and lateFees.',
          properties: {
            dueDate: { type: 'number', description: 'Day of the month when rent is due (e.g. 1 for the 1st of the month, 5 for the 5th).' },
            lateFees: { type: 'string', description: 'Late fee charge explanation or rate (e.g. "50 after the 5th" or "5% of rent").' }
          }
        },
        status: { type: 'string', enum: ['pending', 'active'], description: 'Optional new status of the property setup.' },
        units: {
          type: 'array',
          description: 'Optional array of unit configurations. If single-unit property, configure the first item in this array.',
          items: {
            type: 'object',
            properties: {
              unitId: { type: 'string', description: 'Optional ID of the unit to update (if modifying an existing unit).' },
              label: { type: 'string', description: 'Optional name/label of the unit (e.g. "Main Unit" or "Apt 101").' },
              floor: { type: 'string', description: 'Optional floor location of the unit (e.g. "Ground Floor", "2nd Floor").' },
              unitType: { type: 'string', description: 'Optional unit type (e.g. "Studio", "Apartment", "Penthouse").' },
              rent: { type: 'number', description: 'Optional monthly rent amount.' },
              deposit: { type: 'number', description: 'Optional total security deposit amount.' },
              recurringFeeDetails: {
                type: 'array',
                description: 'Optional list of stacked recurring monthly fees paid with rent.',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'Name of the fee (e.g. Water, Wifi, Trash).' },
                    amount: { type: 'number', description: 'Monthly fee amount.' }
                  },
                  required: ['name', 'amount']
                }
              },
              moveInFeeDetails: {
                type: 'array',
                description: 'Optional list of stacked move-in fees paid when tenant moves in.',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'Name of the move-in fee (e.g. Cleaning fee, Admin fee).' },
                    amount: { type: 'number', description: 'One-time fee amount.' }
                  },
                  required: ['name', 'amount']
                }
              }
            }
          }
        }
      },
      required: ['propertyId']
    },
    execute: (args: any, context: any) => {
      return PropertySetupTool.setupOrUpdatePropertyAndUnits(args, context);
    }
  },
  {
    name: 'addTenantToUnit',
    description: 'Adds a new tenant to a vacant unit. Automatically updates the unit status to occupied, creates a user account for the tenant, and generates initial move-in invoices (Rent, Security Deposit, Recurring Fees, Move-in Fees).',
    parameters: {
      type: 'object',
      properties: {
        propertyId: { type: 'string', description: 'The ID of the property containing the unit.' },
        unitIdOrLabel: { type: 'string', description: 'The ID or label of the unit (e.g. "102" or "A1").' },
        tenantName: { type: 'string', description: 'The full name of the new tenant.' },
        tenantEmail: { type: 'string', description: 'The email address of the new tenant.' }
      },
      required: ['propertyId', 'unitIdOrLabel', 'tenantName', 'tenantEmail']
    },
    execute: (args: any, context: any) => {
      return AddTenantTool.execute(args, context);
    }
  },
  {
    name: 'addInvoice',
    description: 'Generates an invoice for a specific tenant or unit. Use this to bill a tenant for rent, fees, or other charges.',
    parameters: {
      type: 'object',
      properties: {
        propertyId: { type: 'string', description: 'Optional property ID to attach the invoice to.' },
        unitIdOrLabel: { type: 'string', description: 'Optional unit ID or label to attach the invoice to.' },
        tenantEmail: { type: 'string', description: 'Optional tenant email to bill directly if unit is not specified.' },
        amount: { type: 'number', description: 'The total amount due on the invoice.' },
        description: { type: 'string', description: 'Explanation or memo for the invoice (e.g. "Maintenance Fee").' },
        dueDateStr: { type: 'string', description: 'Optional ISO date string for when the invoice is due. Defaults to today.' },
        type: { type: 'string', enum: ['Rent', 'Fee', 'Deposit', 'Maintenance', 'Other'], description: 'Optional classification type of the invoice. Defaults to Fee.' }
      },
      required: ['amount', 'description']
    },
    execute: (args: any, context: any) => {
      return AddInvoiceTool.execute(args, context);
    }
  },
  {
    name: 'manageMaintenanceTickets',
    description: 'Handles all basic CRUD operations on maintenance tickets. Use this to fetch tickets (filter by status/urgency), create new tickets for tenants, update a ticket status, close and rate a ticket, or reject a ticket.',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['fetch', 'create', 'update_status', 'close_and_rate', 'reject'], description: 'The CRUD/reject action to perform.' },
        status: { type: 'string', description: 'For fetch or update_status: the status of the ticket (e.g., open, assigned, closed).' },
        urgency: { type: 'string', description: 'For fetch or create: urgency level (low, medium, high, emergency).' },
        propertyId: { type: 'string', description: 'For fetch or create: ID of the associated property.' },
        title: { type: 'string', description: 'For create: title of the issue.' },
        description: { type: 'string', description: 'For create: detailed description of the issue.' },
        category: { type: 'string', description: 'For create: category (Plumbing, Electrical, General).' },
        unitId: { type: 'string', description: 'For create: ID of the unit.' },
        ticketId: { type: 'string', description: 'For update_status, close_and_rate, or reject: the target ticket ID.' },
        newStatus: { type: 'string', description: 'For update_status: the new status string.' },
        rating: { type: 'number', description: 'For close_and_rate: rating score out of 5.' },
        ratingComment: { type: 'string', description: 'For close_and_rate: feedback text.' },
        message: { type: 'string', description: 'For reject: the rejection explanation message sent to the tenant.' }
      },
      required: ['action']
    },
    execute: (args: any, context: any) => {
      return TicketManagerTool.execute(args, context);
    }
  },
  {
    name: 'manageContractors',
    description: 'Searches the marketplace for available professional contractors and allows bookmarking them.',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['browse', 'bookmark'], description: 'Action to perform on the marketplace.' },
        specialty: { type: 'string', description: 'For browse: specialty filter (e.g., Plumber, Electrician).' },
        maxHourlyRate: { type: 'number', description: 'For browse: max hourly rate in euros.' },
        locationName: { type: 'string', description: 'For browse: location text to search near.' },
        contractorId: { type: 'string', description: 'For bookmark: ID of the contractor to save.' }
      },
      required: ['action']
    },
    execute: (args: any, context: any) => {
      return ContractorMarketplaceTool.execute(args, context);
    }
  },
  {
    name: 'dispatchAndSettleTicket',
    description: 'A powerful dispatch engine. Use this to assign a ticket to a contractor, request a quote, settle financials (pay contractor directly, or pay and bill the tenant via invoice), and notify the tenant of the schedule.',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['assign', 'request_quote', 'approve_and_settle', 'notify_tenant'], description: 'Action to perform.' },
        ticketId: { type: 'string', description: 'The target ticket ID.' },
        contractorId: { type: 'string', description: 'For assign or request_quote: ID of the contractor.' },
        hourlyRate: { type: 'number', description: 'For assign: hourly quote price in euros.' },
        maxAuthorization: { type: 'number', description: 'For assign: maximum authorized budget before asking for approval.' },
        settleAction: { type: 'string', enum: ['pay_now', 'approve_quote_only', 'pay_and_bill_tenant', 'bill_tenant_only', 'pay_at_company_expense', 'pay_and_charge_tenant', 'finalize_without_paying'], description: 'For approve_and_settle: the financial routing logic.' },
        amount: { type: 'number', description: 'For approve_and_settle: the total amount in euros.' },
        message: { type: 'string', description: 'For notify_tenant: message body to send to the tenant regarding scheduling.' }
      },
      required: ['action', 'ticketId']
    },
    execute: (args: any, context: any) => {
      return DispatchEngineTool.execute(args, context);
    }
  },
  {
    name: 'getTenantInvoices',
    description: 'Pulls a full consolidated invoice ledger/summary for a specific tenant or unit.',
    parameters: {
      type: 'object',
      properties: {
        tenantEmail: { type: 'string', description: 'Email of the tenant.' },
        tenantId: { type: 'string', description: 'ID of the tenant.' },
        unitId: { type: 'string', description: 'ID of the unit.' }
      }
    },
    execute: (args: any, context: any) => {
      return GetTenantInvoicesTool.execute(args, context);
    }
  },
  {
    name: 'manageInvoice',
    description: 'Allows updating an existing invoice, such as marking it as paid, cancelling/waiving it, or adjusting the total amount.',
    parameters: {
      type: 'object',
      properties: {
        invoiceId: { type: 'string', description: 'The ID of the invoice to manage.' },
        action: { type: 'string', enum: ['mark_paid', 'cancel', 'adjust_amount'], description: 'The action to perform on the invoice.' },
        newAmount: { type: 'number', description: 'Required if action is adjust_amount. The new total amount in euros.' },
        notes: { type: 'string', description: 'Optional memo or reason for the action.' }
      },
      required: ['invoiceId', 'action']
    },
    execute: (args: any, context: any) => {
      return ManageInvoiceTool.execute(args, context);
    }
  },
  {
    name: 'manageSyndication',
    description: 'Manages unit syndications/listings. Allows fetching active listings, syndicating/listing vacant units, updating listing details (rent, deposit, county, subcounty, latitude, longitude, amenities, rules, photos/images), or unlisting individual units or entire properties.',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['get_listings', 'list', 'update', 'unlist_unit', 'unlist_property'], description: 'The syndication action to perform.' },
        propertyId: { type: 'string', description: 'Required for "list" and "unlist_property". ID of the property to syndicate or unlist.' },
        unitIds: { type: 'array', items: { type: 'string' }, description: 'Required for "list". Array of unit IDs to list under the property.' },
        unitId: { type: 'string', description: 'Required for "update" and "unlist_unit". ID of the specific unit to update or take down.' },
        rent: { type: 'number', description: 'Optional: Rent amount for the listing.' },
        deposit: { type: 'number', description: 'Optional: Security deposit for the listing.' },
        moveInFees: { type: 'number', description: 'Optional: Move-in fees for the listing.' },
        moveInFeeDetails: { type: 'string', description: 'Optional: Move-in fee description.' },
        recurringFees: { type: 'number', description: 'Optional: Total stacked monthly recurring fees.' },
        recurringFeeDetails: { type: 'string', description: 'Optional: Description details of recurring fees.' },
        images: { type: 'array', items: { type: 'string' }, description: 'Optional: Array of image URLs for the listing.' },
        county: { type: 'string', description: 'Optional: County location of the listing.' },
        subcounty: { type: 'string', description: 'Optional: Subcounty location.' },
        latitude: { type: 'number', description: 'Optional: Latitude coordinate.' },
        longitude: { type: 'number', description: 'Optional: Longitude coordinate.' },
        amenities: { type: 'array', items: { type: 'string' }, description: 'Optional: List of amenities (e.g. WiFi, Pool).' },
        rules: { type: 'array', items: { type: 'string' }, description: 'Optional: List of property rules (e.g. No Pets).' }
      },
      required: ['action']
    },
    execute: (args: any, context: any) => {
      return SyndicationTool.execute(args, context);
    }
  },
  {
    name: 'getOrganizationInfo',
    description: 'Retrieves current organization metadata including name, date of creation, owner details, list of team members with their roles and permissions, and pending/unused invitations.',
    parameters: {
      type: 'object',
      properties: {}
    },
    execute: (args: any, context: any) => {
      return GetOrganizationInfoTool.execute(args, context);
    }
  }
];

/**
 * Format tools registry into standard OpenAI JSON function declarations.
 */
export function getOpenAITools() {
  return toolsRegistry.map(t => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }
  }));
}

/**
 * Format tools registry into standard Gemini SDK function declarations.
 */
export function getGeminiTools() {
  return [
    {
      functionDeclarations: toolsRegistry.map(t => {
        // Deep copy parameters and convert all 'type' string values to uppercase
        const uppercaseParameters = JSON.parse(
          JSON.stringify(t.parameters),
          (key, value) => (key === 'type' && typeof value === 'string' ? value.toUpperCase() : value)
        );

        return {
          name: t.name,
          description: t.description,
          parameters: uppercaseParameters,
        };
      })
    }
  ];
}
