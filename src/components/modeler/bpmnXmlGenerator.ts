import { ProcessDefinition, BPMNNode, BPMNEdge } from '../../types/bpm';

/**
 * Generates BPMN 2.0 XML with full Camunda 8 (Zeebe) and Flowable 7 compatibility.
 */
export function generateBpmnXml(process: ProcessDefinition): string {
  const isCamunda = process.engine === 'Camunda';
  const namespaces = isCamunda
    ? `xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
  xmlns:modeler="http://camunda.org/schema/modeler/1.0"`
    : `xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:flowable="http://flowable.org/bpmn"`;

  const pools = process.pools || [
    {
      id: `Pool_${process.key}`,
      name: process.name,
      participantRef: `Participant_${process.key}`,
      x: 30,
      y: 30,
      width: 1200,
      height: 700,
      lanes: [
        { id: 'Lane_RM', name: 'Cán Bộ Bán Hàng & Tiếp Nhận (RM / Sales)', actorRole: 'NCLOS SALE', actorType: 'HUMAN', y: 30, height: 220 },
        { id: 'Lane_Underwriter', name: 'Thẩm Định & Kiểm Soát (Credit Underwriter)', actorRole: 'NCLOS B CO', actorType: 'HUMAN', y: 250, height: 240 },
        { id: 'Lane_Core', name: 'Tự Động Hóa Core Banking (Zeebe Job Workers / STP)', actorRole: 'ZEEBE_WORKER', actorType: 'SYSTEM', y: 490, height: 240 }
      ]
    }
  ];

  // Generate Collaboration & Pools
  const collaborationXml = `  <bpmn:collaboration id="Collaboration_${process.key}">
${pools.map(pool => `    <bpmn:participant id="${pool.id}" name="${pool.name}" processRef="Process_${process.key}" />`).join('\n')}
  </bpmn:collaboration>`;

  // Generate LaneSet XML
  const laneSetXml = `    <bpmn:laneSet id="LaneSet_${process.key}">
${pools.flatMap(p => p.lanes).map(lane => `      <bpmn:lane id="${lane.id}" name="${lane.name}">
        <!-- Actor: ${lane.actorRole} (${lane.actorType}) -->
${process.nodes.filter(n => n.laneId === lane.id || (!n.laneId && lane.id.includes('Underwriter'))).map(n => `        <bpmn:flowNodeRef>${n.id}</bpmn:flowNodeRef>`).join('\n')}
      </bpmn:lane>`).join('\n')}
    </bpmn:laneSet>`;

  // Generate Flow Nodes XML
  const flowNodesXml = process.nodes.map(node => {
    const extElements: string[] = [];

    // Zeebe / Camunda 8 Extensions
    if (isCamunda) {
      if (node.type === 'serviceTask' && (node.jobType || node.id)) {
        const jobType = node.jobType || `${node.id.toLowerCase()}-worker`;
        const retries = node.jobRetries ?? 3;
        extElements.push(`        <zeebe:taskDefinition type="${jobType}" retries="${retries}" />`);
      }

      if (node.type === 'userTask') {
        const candidateGroups = node.candidateGroups?.length ? node.candidateGroups.join(', ') : (node.assigneeRole || 'NCLOS B CO');
        extElements.push(`        <zeebe:assignmentDefinition candidateGroups="${candidateGroups}" />`);
        if (node.formKey) {
          extElements.push(`        <zeebe:formDefinition formKey="${node.formKey}" />`);
        }
      }

      if (node.type === 'businessRuleTask') {
        const decisionId = node.calledDecision?.decisionId || `${node.id}_decision`;
        const resultVar = node.calledDecision?.resultVariable || 'decisionResult';
        extElements.push(`        <zeebe:calledDecision decisionId="${decisionId}" resultVariable="${resultVar}" />`);
      }

      if (node.type === 'callActivity') {
        const procId = node.calledElement?.processId || 'sub_process_contract';
        extElements.push(`        <zeebe:calledElement processId="${procId}" propagateAllChildVariables="true" />`);
      }

      if (node.ioMapping && (node.ioMapping.inputs.length > 0 || node.ioMapping.outputs.length > 0)) {
        const inputsXml = node.ioMapping.inputs.map(i => `          <zeebe:input source="${i.source}" target="${i.target}" />`).join('\n');
        const outputsXml = node.ioMapping.outputs.map(o => `          <zeebe:output source="${o.source}" target="${o.target}" />`).join('\n');
        extElements.push(`        <zeebe:ioMapping>\n${inputsXml}\n${outputsXml}\n        </zeebe:ioMapping>`);
      }
    } else {
      // Flowable 7 Extensions
      if (node.type === 'userTask') {
        const candidateGroups = node.candidateGroups?.length ? node.candidateGroups.join(',') : (node.assigneeRole || 'NCLOS B CO');
        extElements.push(`        <flowable:candidateGroups>${candidateGroups}</flowable:candidateGroups>`);
        if (node.formKey) {
          extElements.push(`        <flowable:formKey>${node.formKey}</flowable:formKey>`);
        }
      }
      if (node.type === 'serviceTask') {
        extElements.push(`        <flowable:delegateExpression>\${${node.id}ServiceDelegate}</flowable:delegateExpression>`);
      }
    }

    if (node.executionListeners && node.executionListeners.length > 0) {
      node.executionListeners.forEach(l => {
        extElements.push(`        <${isCamunda ? 'zeebe:executionListener' : 'flowable:executionListener'} event="${l.event}" delegateExpression="${l.value}" />`);
      });
    }

    const extXml = extElements.length > 0
      ? `\n      <bpmn:extensionElements>\n${extElements.join('\n')}\n      </bpmn:extensionElements>`
      : '';

    // Multi-instance XML
    const multiInstanceXml = node.multiInstance
      ? `\n      <bpmn:multiInstanceLoopCharacteristics isSequential="${node.multiInstance.isSequential}">
        ${node.multiInstance.inputCollection ? `<bpmn:loopDataInputRef>${node.multiInstance.inputCollection}</bpmn:loopDataInputRef>` : ''}
        ${node.multiInstance.inputElement ? `<bpmn:inputDataItem name="${node.multiInstance.inputElement}" />` : ''}
        ${node.multiInstance.completionCondition ? `<bpmn:completionCondition>${node.multiInstance.completionCondition}</bpmn:completionCondition>` : ''}
      </bpmn:multiInstanceLoopCharacteristics>`
      : '';

    // Element Tag mapping
    switch (node.type) {
      case 'startEvent':
      case 'messageStartEvent':
      case 'timerStartEvent':
        return `    <bpmn:startEvent id="${node.id}" name="${node.name}">${extXml}${multiInstanceXml}\n    </bpmn:startEvent>`;
      case 'userTask':
        return `    <bpmn:userTask id="${node.id}" name="${node.name}"${!isCamunda && node.assigneeRole ? ` flowable:candidateGroups="${node.assigneeRole}"` : ''}>${extXml}${multiInstanceXml}\n    </bpmn:userTask>`;
      case 'serviceTask':
        return `    <bpmn:serviceTask id="${node.id}" name="${node.name}">${extXml}${multiInstanceXml}\n    </bpmn:serviceTask>`;
      case 'businessRuleTask':
        return `    <bpmn:businessRuleTask id="${node.id}" name="${node.name}">${extXml}\n    </bpmn:businessRuleTask>`;
      case 'scriptTask':
        return `    <bpmn:scriptTask id="${node.id}" name="${node.name}" scriptFormat="${node.scriptFormat || 'feel'}">
      <bpmn:script>${node.scriptBody || '// script expression'}</bpmn:script>${extXml}\n    </bpmn:scriptTask>`;
      case 'sendTask':
        return `    <bpmn:sendTask id="${node.id}" name="${node.name}">${extXml}\n    </bpmn:sendTask>`;
      case 'receiveTask':
        return `    <bpmn:receiveTask id="${node.id}" name="${node.name}" messageRef="Message_${node.id}">${extXml}\n    </bpmn:receiveTask>`;
      case 'callActivity':
        return `    <bpmn:callActivity id="${node.id}" name="${node.name}">${extXml}\n    </bpmn:callActivity>`;
      case 'exclusiveGateway':
        return `    <bpmn:exclusiveGateway id="${node.id}" name="${node.name}" />`;
      case 'parallelGateway':
        return `    <bpmn:parallelGateway id="${node.id}" name="${node.name}" />`;
      case 'inclusiveGateway':
        return `    <bpmn:inclusiveGateway id="${node.id}" name="${node.name}" />`;
      case 'eventBasedGateway':
        return `    <bpmn:eventBasedGateway id="${node.id}" name="${node.name}" />`;
      case 'intermediateCatchEvent':
      case 'intermediateTimerEvent':
      case 'intermediateMessageEvent':
        return `    <bpmn:intermediateCatchEvent id="${node.id}" name="${node.name}">${extXml}\n    </bpmn:intermediateCatchEvent>`;
      case 'boundaryTimerEvent':
        return `    <bpmn:boundaryEvent id="${node.id}" name="${node.name}" attachedToRef="${node.id.replace('boundary_', '')}">
      <bpmn:timerEventDefinition />
    </bpmn:boundaryEvent>`;
      case 'boundaryErrorEvent':
        return `    <bpmn:boundaryEvent id="${node.id}" name="${node.name}" attachedToRef="${node.id.replace('boundary_', '')}">
      <bpmn:errorEventDefinition errorCode="${node.errorCode || 'ERR_RETRY'}" />
    </bpmn:boundaryEvent>`;
      case 'endEvent':
      case 'terminateEndEvent':
      case 'errorEndEvent':
        return `    <bpmn:endEvent id="${node.id}" name="${node.name}">${node.type === 'terminateEndEvent' ? '\n      <bpmn:terminateEventDefinition />' : ''}\n    </bpmn:endEvent>`;
      case 'dataStore':
        return `    <bpmn:dataStoreReference id="${node.id}" name="${node.name}" />`;
      case 'dataObject':
        return `    <bpmn:dataObjectReference id="${node.id}" name="${node.name}" />`;
      case 'textAnnotation':
        return `    <bpmn:textAnnotation id="${node.id}">
      <bpmn:text>${node.name}</bpmn:text>
    </bpmn:textAnnotation>`;
      default:
        return `    <bpmn:task id="${node.id}" name="${node.name}">${extXml}\n    </bpmn:task>`;
    }
  }).join('\n');

  // Generate Sequence Flows
  const sequenceFlowsXml = process.edges.map(e => {
    const conditionXml = e.condition
      ? `\n      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${e.condition}</bpmn:conditionExpression>`
      : '';
    return `    <bpmn:sequenceFlow id="${e.id}" sourceRef="${e.source}" targetRef="${e.target}"${e.label ? ` name="${e.label}"` : ''}>${conditionXml}\n    </bpmn:sequenceFlow>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions ${namespaces}
  id="Definitions_${process.key}"
  targetNamespace="http://bpmn.io/schema/bpmn"
  exporter="Camunda Modeler"
  exporterVersion="5.22.0">
${collaborationXml}
  <bpmn:process id="Process_${process.key}" name="${process.name}" isExecutable="true">
${laneSetXml}
${flowNodesXml}
${sequenceFlowsXml}
  </bpmn:process>
</bpmn:definitions>`;
}
