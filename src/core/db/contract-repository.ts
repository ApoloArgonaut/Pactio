import type { ContractData, ContractStatus } from '../schemas/contract.js';
import type { AuditEvent } from '../schemas/audit.js';
import type { AdjustmentSuggestion } from '../schemas/adjustment.js';
import type { SignatureRecord, Nom151Stamp } from '../schemas/signature.js';

/**
 * Repositorio de Contratos en Memoria con Semántica de Producción.
 * Diseñado con interfaces idénticas a un adaptador Prisma / Drizzle / PostgreSQL.
 */
class InMemoryContractRepository {
  private contracts = new Map<string, ContractData>(); // Key: contractCode (ej. PACT-8X9K2)
  private idToCode = new Map<string, string>();        // Key: UUID -> contractCode

  public async save(contract: ContractData): Promise<ContractData> {
    this.contracts.set(contract.contractCode, { ...contract });
    this.idToCode.set(contract.id, contract.contractCode);
    return contract;
  }

  public async findByCode(contractCode: string): Promise<ContractData | null> {
    const found = this.contracts.get(contractCode.toUpperCase());
    if (!found || found.deletedAt !== null) return null;
    return { ...found };
  }

  public async findById(id: string): Promise<ContractData | null> {
    const code = this.idToCode.get(id);
    if (!code) return null;
    return this.findByCode(code);
  }

  public async updateStatus(contractCode: string, status: ContractStatus): Promise<ContractData> {
    const contract = await this.findByCode(contractCode);
    if (!contract) throw new Error(`Contrato ${contractCode} no encontrado`);

    contract.status = status;
    contract.updatedAt = new Date().toISOString();
    return this.save(contract);
  }

  public async addAuditEvent(contractCode: string, event: AuditEvent): Promise<ContractData> {
    const contract = await this.findByCode(contractCode);
    if (!contract) throw new Error(`Contrato ${contractCode} no encontrado`);

    contract.auditTrail.push(event);
    contract.updatedAt = new Date().toISOString();
    return this.save(contract);
  }

  public async addAdjustment(contractCode: string, adjustment: AdjustmentSuggestion): Promise<ContractData> {
    const contract = await this.findByCode(contractCode);
    if (!contract) throw new Error(`Contrato ${contractCode} no encontrado`);

    contract.adjustments.push(adjustment);
    contract.versionMinor += 1;
    contract.updatedAt = new Date().toISOString();
    return this.save(contract);
  }

  public async attachSignature(
    contractCode: string,
    role: 'creator' | 'client',
    signature: SignatureRecord
  ): Promise<ContractData> {
    const contract = await this.findByCode(contractCode);
    if (!contract) throw new Error(`Contrato ${contractCode} no encontrado`);

    contract.signatures[role] = signature;
    contract.updatedAt = new Date().toISOString();
    return this.save(contract);
  }

  public async attachNom151Stamp(contractCode: string, stamp: Nom151Stamp): Promise<ContractData> {
    const contract = await this.findByCode(contractCode);
    if (!contract) throw new Error(`Contrato ${contractCode} no encontrado`);

    contract.nom151Stamp = stamp;
    contract.status = 'COMPLETED_NOM151';
    contract.updatedAt = new Date().toISOString();
    return this.save(contract);
  }

  public async softDelete(contractCode: string): Promise<boolean> {
    const contract = await this.findByCode(contractCode);
    if (!contract) return false;

    contract.deletedAt = new Date().toISOString();
    await this.save(contract);
    return true;
  }

  public clear(): void {
    this.contracts.clear();
    this.idToCode.clear();
  }
}

export const contractRepository = new InMemoryContractRepository();
