import React, { useState, useEffect } from 'react';
import { useContractStore } from './core/store/contract-store';
import { ThemeMode, ActiveTab } from './types/theme';
import { useThemeStyles } from './hooks/useThemeStyles';
import { Navbar } from './components/layout/Navbar';
import { LandingView } from './components/landing/LandingView';
import { WizardStepContainer } from './components/wizard/WizardStepContainer';
import { DocumentPreviewSheet } from './components/preview/DocumentPreviewSheet';
import { ClientSimulatorView } from './components/simulator/ClientSimulatorView';
import { NegotiationDrawer } from './components/simulator/NegotiationDrawer';
import { VaultDashboard } from './components/vault/VaultDashboard';
import { ConfirmedView } from './components/confirmed/ConfirmedView';
import { SignatureHubModal } from './components/modals/SignatureHubModal';

export default function App() {
  const store = useContractStore();
  const [theme, setTheme] = useState<ThemeMode>('midnight');
  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');
  const [currentStep, setCurrentStep] = useState(1);
  const [fontScale, setFontScale] = useState(100);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Negotiation Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [adjustedDays, setAdjustedDays] = useState(5);
  const [hasAdjustmentProposal, setHasAdjustmentProposal] = useState(false);

  // Signature Modal state
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signatureType, setSignatureType] = useState<'touch' | 'type' | 'efirma'>('touch');
  const [typedName, setTypedName] = useState('Sofía Valenzuela Mendoza');
  const [signatureDone, setSignatureDone] = useState(false);
  const [isStamping, setIsStamping] = useState(false);
  const [stampedSuccess, setStampedSuccess] = useState(false);
  const [stampingStep, setStampingStep] = useState(0);

  // Cryptographic Audit Inspector Popover
  const [showAuditInspector, setShowAuditInspector] = useState(false);

  // Vault Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Centralized Theme Styles Hook (synchronizes HTML root data-theme and Tailwind dark class)
  const styles = useThemeStyles(theme);

  // Universal Font Scaler: Updates root HTML font-size so all rem units scale proportionally
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`;
  }, [fontScale]);

  // Currency Symbol helper
  const currencySymbol = store.payments.currency === 'EUR' ? '€' : '$';

  // Safe Signature Modal Opener (prevents empty modal on re-entry)
  const handleOpenSignatureModal = () => {
    setStampedSuccess(false);
    setIsStamping(false);
    setStampingStep(0);
    setSignatureDone(false);
    setIsSignModalOpen(true);
  };

  // Stamping Simulation Workflow (transitions state machine to COMPLETED_NOM151)
  const handleStartStamping = () => {
    setIsStamping(true);
    setStampingStep(1);
    setTimeout(() => setStampingStep(2), 600);
    setTimeout(() => setStampingStep(3), 1300);
    setTimeout(() => setStampingStep(4), 2000);
    setTimeout(() => {
      setIsStamping(false);
      setStampedSuccess(true);
      setIsSignModalOpen(false);
      store.updateStatus('COMPLETED_NOM151');
      setActiveTab('confirmed');
    }, 2600);
  };

  // Real File Downloads
  const handleDownloadMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([store.cachedCanonicalMarkdown || '# Contrato Pactio'], {
      type: 'text/markdown;charset=utf-8'
    });
    element.href = URL.createObjectURL(file);
    element.download = `${store.contractCode}_Contrato_Formalizado.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadNOM151Receipt = () => {
    const receiptData = {
      constanciaId: `NOM151-${store.contractCode}-${Date.now()}`,
      contractCode: store.contractCode,
      canonicalSha256: store.cachedDocumentHash,
      cenamTimestampUtc: new Date().toISOString(),
      pscAuthority: 'CN=PSC PACTIO NOM-151 TSA 01, OU=PRESTADOR DE SERVICIOS DE CERTIFICACION, O=SECRETARIA DE ECONOMIA, C=MX',
      regulatoryPolicyOid: '1.3.6.1.4.1.42.2.27.1',
      parties: {
        creator: store.parties.creator.legalName,
        client: store.parties.client.legalName
      },
      integrityStatus: 'VERIFIED_0_COLLISION'
    };
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(receiptData, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    element.href = URL.createObjectURL(file);
    element.download = `Constancia_NOM151_${store.contractCode}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyLink = () => {
    const fakeUrl = `${window.location.origin}/review/${store.contractCode}`;
    navigator.clipboard.writeText(fakeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(store.contractCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Dynamic Milestone Auto-Balancer (100% Guaranteed)
  const handleAddMilestone = () => {
    const count = store.payments.milestones.length + 1;
    const currentSum = store.payments.milestones.reduce((acc, m) => acc + m.percentage, 0);
    const remainingPercent = Math.max(0, 100 - currentSum);
    const amount = Math.round((store.payments.totalAmountCents * remainingPercent) / 100);
    store.addMilestone({
      id: `m${count}-${Date.now()}`,
      order: count,
      title: `Hito ${count}: Entregable adicional`,
      percentage: remainingPercent,
      amountCents: amount,
      deliverables: ['Entregable complementario acordado'],
      status: 'pending'
    });
  };

  const handleAutoBalanceMilestones = () => {
    const list = store.payments.milestones;
    if (list.length === 0) return;
    const equalShare = Math.floor(100 / list.length);
    const rem = 100 - equalShare * list.length;
    list.forEach((m, idx) => {
      const p = equalShare + (idx === list.length - 1 ? rem : 0);
      const amt = Math.round((store.payments.totalAmountCents * p) / 100);
      store.updateMilestone(m.id, { percentage: p, amountCents: amt });
    });
  };

  return (
    <div className={`min-h-screen ${styles.themeClasses} theme-${theme} flex flex-col font-sans transition-colors duration-200`} data-theme={theme}>
      {/* 1. Global Navigation Bar */}
      <Navbar
        contractCode={store.contractCode}
        copiedCode={copiedCode}
        onCopyCode={handleCopyCode}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        previewMode={store.previewMode}
        onSelectPreviewMode={store.setPreviewMode}
        theme={theme}
        onSelectTheme={setTheme}
        fontScale={fontScale}
        onChangeFontScale={setFontScale}
        styles={styles}
      />

      {/* 2. Main Content Router */}
      <main className="flex-1 flex flex-col">
        {/* TAB: Landing Page */}
        {activeTab === 'landing' && (
          <LandingView
            onStartDraft={() => {
              setActiveTab('creator');
              setCurrentStep(1);
            }}
            onOpenClientSimulator={() => setActiveTab('client-review')}
            styles={styles}
          />
        )}

        {/* TAB: Creator Split-Pane Editor */}
        {activeTab === 'creator' && (
          <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-61px)] overflow-hidden">
            <WizardStepContainer
              currentStep={currentStep}
              onPrevStep={() => setCurrentStep((s) => Math.max(1, s - 1))}
              onNextStep={() => setCurrentStep((s) => Math.min(5, s + 1))}
              onProceedToSign={handleOpenSignatureModal}
              autosaveStatus={store.autosaveStatus}
              creator={store.parties.creator}
              client={store.parties.client}
              onUpdateCreator={store.updateCreator}
              onUpdateClient={store.updateClient}
              scope={store.scope}
              onUpdateScope={store.updateScope}
              totalAmountCents={store.payments.totalAmountCents}
              currency={store.payments.currency}
              currencySymbol={currencySymbol}
              milestones={store.payments.milestones}
              onUpdatePayments={store.updatePayments}
              onApplyPaymentPreset={store.applyPaymentPreset}
              onUpdateMilestone={store.updateMilestone}
              onAddMilestone={handleAddMilestone}
              onDeleteMilestone={store.removeMilestone}
              onAutoBalanceMilestones={handleAutoBalanceMilestones}
              intellectualProperty={store.intellectualProperty}
              onUpdateIP={store.updateIP}
              governance={store.governance}
              onUpdateGovernance={store.updateGovernance}
              activeTooltip={activeTooltip}
              onToggleTooltip={(name) => setActiveTooltip(activeTooltip === name ? null : name)}
              theme={theme}
              styles={styles}
            />

            <DocumentPreviewSheet
              theme={theme}
              styles={styles}
              previewMode={store.previewMode}
              contractCode={store.contractCode}
              scopeTitle={store.scope.projectTitle}
              creatorLegalName={store.parties.creator.legalName}
              creatorCommercialName={store.parties.creator.commercialName}
              clientLegalName={store.parties.client.legalName}
              totalAmountCents={store.payments.totalAmountCents}
              currency={store.payments.currency}
              currencySymbol={currencySymbol}
              milestones={store.payments.milestones}
              cachedDocumentHash={store.cachedDocumentHash}
              signatureDone={signatureDone}
              typedName={typedName}
              signatureType={signatureType}
              stampedSuccess={stampedSuccess}
              showAuditInspector={showAuditInspector}
              onToggleAuditInspector={() => setShowAuditInspector(!showAuditInspector)}
              onPrint={handlePrint}
              onProceedToSign={handleOpenSignatureModal}
              isCreatorView={true}
            />
          </div>
        )}

        {/* TAB: Client Simulator Mode */}
        {activeTab === 'client-review' && (
          <ClientSimulatorView
            contractCode={store.contractCode}
            scopeTitle={store.scope.projectTitle}
            creatorLegalName={store.parties.creator.legalName}
            creatorCommercialName={store.parties.creator.commercialName}
            clientLegalName={store.parties.client.legalName}
            totalAmountCents={store.payments.totalAmountCents}
            currency={store.payments.currency}
            currencySymbol={currencySymbol}
            milestonesCount={store.payments.milestones.length}
            includedRevisionRounds={store.governance.includedRevisionRounds}
            onOpenNegotiationDrawer={() => setIsDrawerOpen(true)}
            onOpenSignatureModal={handleOpenSignatureModal}
            styles={styles}
          />
        )}

        {/* TAB: Vault Dashboard */}
        {activeTab === 'vault' && (
          <VaultDashboard
            contractCode={store.contractCode}
            scopeTitle={store.scope.projectTitle}
            clientLegalName={store.parties.client.legalName}
            totalAmountCents={store.payments.totalAmountCents}
            currency={store.payments.currency}
            currencySymbol={currencySymbol}
            searchQuery={searchQuery}
            onChangeSearchQuery={setSearchQuery}
            onEditActiveContract={() => {
              setActiveTab('creator');
              setCurrentStep(1);
            }}
            onDownloadMarkdown={handleDownloadMarkdown}
            styles={styles}
          />
        )}

        {/* TAB: Confirmed Hub Post-Signature */}
        {activeTab === 'confirmed' && (
          <ConfirmedView
            contractCode={store.contractCode}
            cachedDocumentHash={store.cachedDocumentHash}
            onDownloadMarkdown={handleDownloadMarkdown}
            onPrint={handlePrint}
            onDownloadNOM151Receipt={handleDownloadNOM151Receipt}
            copiedLink={copiedLink}
            onCopyLink={handleCopyLink}
            onResetContract={() => {
              store.resetContract();
              setActiveTab('creator');
              setCurrentStep(1);
            }}
            onGoToVault={() => setActiveTab('vault')}
            styles={styles}
          />
        )}
      </main>

      {/* 3. Global Modals & Drawers */}
      <NegotiationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        adjustedDays={adjustedDays}
        onChangeAdjustedDays={setAdjustedDays}
        hasAdjustmentProposal={hasAdjustmentProposal}
        onSendAdjustment={() => setHasAdjustmentProposal(true)}
        onAcceptAdjustment={() => {
          store.updateGovernance({ tacitApprovalWindowDays: adjustedDays });
          setHasAdjustmentProposal(false);
          setIsDrawerOpen(false);
        }}
        styles={styles}
      />

      <SignatureHubModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        signatureType={signatureType}
        onSelectSignatureType={setSignatureType}
        typedName={typedName}
        onChangeTypedName={setTypedName}
        signatureDone={signatureDone}
        onSignatureDoneChange={setSignatureDone}
        isStamping={isStamping}
        stampingStep={stampingStep}
        onStartStamping={handleStartStamping}
        styles={styles}
      />
    </div>
  );
}
