import { DMNDecisionDefinition } from '../../types/dmn';

/**
 * Escapes special XML characters to ensure valid OMG DMN 1.3 XML.
 */
export function escapeXmlText(val: string | number | boolean | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Escapes XML attribute values.
 */
export function escapeXmlAttr(val: string | number | boolean | undefined | null): string {
  return escapeXmlText(val);
}

/**
 * Generates OMG DMN 1.3 XML compliant with Camunda 8 (Zeebe DMN engine) and Flowable DMN.
 */
export function generateDmnXml(decision: DMNDecisionDefinition): string {
  const inputsXml = decision.inputs.map(input => `      <input id="${escapeXmlAttr(input.id)}" label="${escapeXmlAttr(input.label)}">
        <inputExpression id="InputExpression_${escapeXmlAttr(input.id)}" typeRef="${escapeXmlAttr(input.typeRef)}">
          <text>${escapeXmlText(input.expression)}</text>
        </inputExpression>
      </input>`).join('\n');

  const outputsXml = decision.outputs.map(output => 
    `      <output id="${escapeXmlAttr(output.id)}" label="${escapeXmlAttr(output.label)}" name="${escapeXmlAttr(output.name)}" typeRef="${escapeXmlAttr(output.typeRef)}" />`
  ).join('\n');

  const rulesXml = decision.rules.map(rule => {
    const inputEntries = decision.inputs.map(input => {
      const rawVal = rule.inputEntries[input.id] || '-';
      return `        <inputEntry id="UnaryTests_${escapeXmlAttr(rule.id)}_${escapeXmlAttr(input.id)}">
          <text>${escapeXmlText(rawVal)}</text>
        </inputEntry>`;
    }).join('\n');

    const outputEntries = decision.outputs.map(output => {
      const rawVal = rule.outputEntries[output.id] !== undefined ? rule.outputEntries[output.id] : '-';
      const formattedVal = typeof rawVal === 'string' && !rawVal.startsWith('"') && rawVal !== '-' 
        ? `"${rawVal}"` 
        : String(rawVal);
      return `        <outputEntry id="LiteralExpression_${escapeXmlAttr(rule.id)}_${escapeXmlAttr(output.id)}">
          <text>${escapeXmlText(formattedVal)}</text>
        </outputEntry>`;
    }).join('\n');

    const descXml = rule.annotation 
      ? `\n        <description>${escapeXmlText(rule.annotation)}</description>` 
      : '';

    return `      <rule id="${escapeXmlAttr(rule.id)}">
${inputEntries}
${outputEntries}${descXml}
      </rule>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" 
  xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" 
  xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" 
  xmlns:camunda="http://camunda.org/schema/1.0/dmn" 
  xmlns:flowable="http://flowable.org/dmn"
  xmlns:biodi="http://bpmn.io/schema/dmn/biodi/2.0"
  id="Definitions_${escapeXmlAttr(decision.key)}" 
  name="${escapeXmlAttr(decision.name)}" 
  namespace="http://camunda.org/schema/1.0/dmn" 
  exporter="Camunda Modeler" 
  exporterVersion="5.22.0">
  <decision id="${escapeXmlAttr(decision.key)}" name="${escapeXmlAttr(decision.name)}">
    <decisionTable id="DecisionTable_${escapeXmlAttr(decision.key)}" hitPolicy="${escapeXmlAttr(decision.hitPolicy)}">
${inputsXml}
${outputsXml}
${rulesXml}
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram id="DMNDiagram_${escapeXmlAttr(decision.key)}">
      <dmndi:DMNShape id="DMNShape_${escapeXmlAttr(decision.key)}" dmnElementRef="${escapeXmlAttr(decision.key)}">
        <dc:Bounds height="80" width="180" x="160" y="100" />
      </dmndi:DMNShape>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>`;
}

/**
 * Triggers a browser download of the DMN decision table as a standard .dmn file.
 */
export function exportDmnFile(decision: DMNDecisionDefinition, customFilename?: string): string {
  const xmlContent = generateDmnXml(decision);
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = customFilename || `${decision.key}.dmn`;
  
  link.href = url;
  link.download = filename.endsWith('.dmn') ? filename : `${filename}.dmn`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
}

