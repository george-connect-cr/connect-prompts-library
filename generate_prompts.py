import json

# 15 categories x 10 prompts = 150
categories = [
  ("office", "Office (General)", "Oficina (General)"),
  ("comms", "Communication & Writing", "Comunicación y Redacción"),
  ("meetings", "Meetings", "Reuniones"),
  ("pm", "Project Management", "Gestión de Proyectos"),
  ("ops_road", "Road Assistance Ops", "Operaciones Road"),
  ("ops_home", "Home Assistance Ops", "Operaciones Home"),
  ("qa", "Quality & QA", "Calidad y QA"),
  ("it", "IT & Support", "IT y Soporte"),
  ("cyber", "Cybersecurity", "Ciberseguridad"),
  ("data", "Data & BI", "Datos y BI"),
  ("finance", "Finance", "Finanzas"),
  ("legal", "Legal & Compliance", "Legal y Compliance"),
  ("hr", "People & HR", "Personas y RRHH"),
  ("procurement", "Procurement & Vendors", "Compras y Proveedores"),
  ("marketing", "Marketing & Sales", "Marketing y Ventas"),
]

# Per-category prompt blueprints (10 each)
blueprints = {
  "office": [
    ("Convertir notas en checklist", "Turn notes into a checklist", "Organiza estas notas en una checklist priorizada.", ["notas"]),
    ("Resumen ejecutivo", "Executive summary", "Resume el documento en 5 bullets y 3 riesgos.", ["documento"]),
    ("Extraer fechas y responsables", "Extract dates and owners", "Extrae deadlines, responsables y dependencias.", ["texto"]),
    ("Redactar SOP", "Write an SOP", "Crea un SOP paso a paso con controles y excepciones.", ["proceso"]),
    ("Mejorar claridad", "Improve clarity", "Reescribe para claridad manteniendo el significado.", ["texto"]),
    ("Tabla de decisiones", "Decision table", "Genera una tabla: opcion / pros / contras / recomendacion.", ["tema"]),
    ("Plan semanal", "Weekly plan", "Crea un plan semanal con bloques y entregables.", ["objetivos"]),
    ("Checklist de calidad", "Quality checklist", "Crea checklist de revision antes de enviar.", ["tipo_documento"]),
    ("Guion para llamada interna", "Internal call script", "Escribe guion breve para alinear a un equipo.", ["objetivo_llamada"]),
    ("Plantilla de documento", "Document template", "Genera plantilla reutilizable con secciones.", ["tipo_documento"]),
  ],
  "comms": [
    ("Correo: seguimiento", "Email: follow-up", "Redacta un follow-up claro y amable.", ["contexto", "accion", "deadline"]),
    ("Correo: rechazo", "Email: polite decline", "Redacta un rechazo profesional con alternativa.", ["solicitud", "razon", "alternativa"]),
    ("Mensaje Teams: accion", "Teams: call-to-action", "Escribe mensaje corto con accion y fecha.", ["accion", "fecha"]),
    ("Anuncio interno", "Internal announcement", "Redacta anuncio con impacto y CTA.", ["tema", "audiencia"]),
    ("Resumen para liderazgo", "Leadership brief", "Sintetiza para liderazgo: contexto, decision, impacto.", ["texto"]),
    ("Reescribir tono", "Rewrite tone", "Ajusta a tono: formal / neutro / cercano.", ["texto", "tono"]),
    ("FAQ desde texto", "FAQ from text", "Crea 10 preguntas frecuentes con respuestas.", ["texto"]),
    ("Respuesta a cliente", "Customer reply", "Redacta respuesta empatica y orientada a solucion.", ["caso"]),
    ("Guion WhatsApp", "WhatsApp script", "Crea guion de WhatsApp con pasos y validaciones.", ["flujo"]),
    ("Traduccion preservando estilo", "Translate preserving style", "Traduce manteniendo tono y terminos.", ["texto", "idioma_destino"]),
  ],
  "meetings": [
    ("Agenda 30 min", "30-min agenda", "Crea agenda de 30 min con objetivos y tiempos.", ["tema", "participantes"]),
    ("Minuta desde transcripcion", "Minutes from transcript", "Genera minuta: acuerdos, tareas, decisiones.", ["transcripcion"]),
    ("Lista de decisiones", "Decision log", "Extrae decisiones tomadas y racional.", ["transcripcion"]),
    ("Parking lot", "Parking lot", "Identifica temas fuera de alcance para tratar despues.", ["notas"]),
    ("Riesgos y bloqueos", "Risks & blockers", "Lista riesgos/bloqueos con mitigaciones.", ["notas"]),
    ("Seguimiento de acciones", "Action follow-up", "Redacta email de acciones con responsables.", ["tareas"]),
    ("Resumen 1-slide", "1-slide summary", "Resume para una slide: what/so what/now what.", ["contenido"]),
    ("Preguntas para alineacion", "Alignment questions", "Genera preguntas para aclarar prioridades.", ["tema"]),
    ("Retro de reunion", "Meeting retro", "Evalua reunion: funciono / mejorar / acciones.", ["notas"]),
    ("Guion de facilitacion", "Facilitation script", "Crea guion para facilitar reunion tensa.", ["contexto"]),
  ],
  "pm": [
    ("WBS / desglose", "Work breakdown", "Desglosa el proyecto en tareas y entregables.", ["descripcion"]),
    ("RACI", "RACI", "Crea matriz RACI (R/A/C/I) para el proyecto.", ["equipo", "tareas"]),
    ("Cronograma", "Timeline", "Propone timeline por semanas con hitos.", ["tareas", "fecha_inicio"]),
    ("Matriz de riesgos", "Risk register", "Crea registro de riesgos con prob/impacto.", ["proyecto"]),
    ("Plan de comunicacion", "Comms plan", "Define stakeholders, canales, frecuencia.", ["proyecto"]),
    ("Definir OKRs", "Define OKRs", "Propone OKRs y metricas para este objetivo.", ["objetivo"]),
    ("User stories", "User stories", "Escribe user stories con criterios de aceptacion.", ["feature"]),
    ("Checklist go-live", "Go-live checklist", "Genera checklist de go-live y rollback.", ["sistema"]),
    ("Notas de release", "Release notes", "Redacta release notes para usuarios.", ["cambios"]),
    ("Postmortem", "Postmortem", "Crea postmortem: timeline, RCA, acciones.", ["incidente"]),
  ],
  "ops_road": [
    ("Resumen de caso de grua", "Tow case summary", "Resume el caso de grua: causa, tiempos, resultado.", ["detalle"]),
    ("Checklist de validacion", "Validation checklist", "Crea checklist para validar cobertura y elegibilidad.", ["pais"]),
    ("Mensaje al proveedor", "Provider message", "Redacta mensaje a proveedor con requisitos y ETA.", ["servicio", "ubicacion"]),
    ("Guion de llamada al cliente", "Customer call script", "Guion para confirmar ubicacion y seguridad.", ["tipo_servicio"]),
    ("Clasificar motivo", "Classify reason", "Clasifica el motivo de asistencia en categorias.", ["descripcion"]),
    ("Riesgos en sitio", "On-site risks", "Identifica riesgos de seguridad y recomendaciones.", ["ubicacion", "condiciones"]),
    ("Reporte diario ops", "Daily ops report", "Genera reporte diario: volumen, SLA, issues.", ["datos"]),
    ("Analisis de demoras", "Delay analysis", "Analiza causas de demoras y acciones.", ["casos"]),
    ("Estandarizar notas", "Standardize notes", "Convierte notas libres a formato estandar.", ["notas"]),
    ("Mensaje de cierre", "Closure message", "Redacta mensaje de cierre y encuesta.", ["resultado"]),
  ],
  "ops_home": [
    ("Resumen de caso hogar", "Home case summary", "Resume caso de hogar: problema, diagnostico, solucion.", ["detalle"]),
    ("Checklist de dispatch", "Dispatch checklist", "Checklist para despachar tecnico hogar.", ["tipo_servicio"]),
    ("Guion de diagnostico", "Diagnostic script", "Preguntas para diagnosticar antes de enviar tecnico.", ["problema"]),
    ("Mensaje al tecnico", "Technician brief", "Brief al tecnico con contexto y restricciones.", ["caso"]),
    ("Politica y cobertura", "Policy & coverage", "Explica cobertura/limites en lenguaje simple.", ["poliza"]),
    ("Reclamo y evidencias", "Claim evidence", "Lista evidencias necesarias para el reclamo.", ["tipo_caso"]),
    ("Reporte semanal hogar", "Weekly home report", "Reporte semanal: tipos, SLA, NPS, fricciones.", ["datos"]),
    ("Clasificacion de urgencia", "Urgency triage", "Clasifica urgencia y recomienda prioridad.", ["descripcion"]),
    ("Estimar costo", "Cost estimate", "Estima rangos de costo y supuestos.", ["trabajo"]),
    ("Mensaje post-servicio", "Post-service message", "Mensaje post-servicio con tips y encuesta.", ["servicio"]),
  ],
  "qa": [
    ("Checklist QA llamada", "Call QA checklist", "Crea checklist de QA para esta llamada.", ["criterios"]),
    ("Feedback al agente", "Agent feedback", "Da feedback: fortalezas, mejoras, coaching.", ["transcripcion"]),
    ("Deteccion de fricciones", "Friction detection", "Detecta fricciones y causa raiz.", ["muestras"]),
    ("Etiquetar intenciones", "Intent labeling", "Etiqueta intents y entidades.", ["transcripcion"]),
    ("Calcular resumen de hallazgos", "Findings summary", "Resume hallazgos por categoria y severidad.", ["hallazgos"]),
    ("Guia de calibracion", "Calibration guide", "Crea guia para sesion de calibracion QA.", ["rubrica"]),
    ("Analisis de NPS verbatim", "NPS verbatim", "Agrupa verbatims por tema y accion.", ["comentarios"]),
    ("Script de coaching", "Coaching script", "Guion de coaching de 10 min.", ["tema"]),
    ("Auditoria de cumplimiento", "Compliance audit", "Evalua cumplimiento de scripts/legales.", ["llamada"]),
    ("Plan de mejora", "Improvement plan", "Plan 30 dias con metricas y rutina.", ["equipo"]),
  ],
  "it": [
    ("Ticket: resumen y proximo paso", "Ticket summary", "Resume ticket y sugiere siguiente paso.", ["ticket"]),
    ("Runbook", "Runbook", "Crea runbook para este incidente.", ["incidente"]),
    ("Comunicado de mantenimiento", "Maintenance notice", "Redacta aviso de mantenimiento con impacto.", ["ventana"]),
    ("Analisis de logs", "Log analysis", "Identifica patrones y causa probable en estos logs.", ["logs"]),
    ("Checklist hardening", "Hardening checklist", "Checklist de hardening para servidor/app.", ["stack"]),
    ("Documentar arquitectura", "Architecture doc", "Genera documento: contexto, diagramas, riesgos.", ["sistema"]),
    ("Plan de pruebas", "Test plan", "Plan de pruebas funcionales y regresion.", ["cambio"]),
    ("Guia de onboarding IT", "IT onboarding", "Checklist onboarding para nuevo miembro.", ["rol"]),
    ("FAQ de soporte", "Support FAQ", "Crea FAQ para usuarios finales.", ["tema"]),
    ("Solicitud a vendor", "Vendor request", "Redacta solicitud tecnica a proveedor.", ["requerimiento"]),
  ],
  "cyber": [
    ("Evaluacion de phishing", "Phishing assessment", "Analiza este correo y puntua riesgo.", ["correo"]),
    ("Respuesta a incidente", "Incident response", "Crea plan IR: contencion, erradicacion, recuperacion.", ["incidente"]),
    ("Politica breve", "Short policy", "Redacta politica breve para usuarios.", ["tema"]),
    ("Evaluacion de proveedor", "Vendor security", "Cuestionario de seguridad para proveedor.", ["tipo_proveedor"]),
    ("Resumen de vulnerabilidades", "Vuln summary", "Resume CVEs y prioriza remediacion.", ["vulns"]),
    ("Modelo de amenazas", "Threat model", "Threat model: activos, amenazas, mitigaciones.", ["sistema"]),
    ("Recomendaciones DLP", "DLP recommendations", "Propone reglas DLP y excepciones.", ["casos_uso"]),
    ("Mensaje de concientizacion", "Awareness message", "Crea mensaje de awareness mensual.", ["tema"]),
    ("Checklist acceso minimo", "Least privilege", "Checklist para revisar permisos y roles.", ["sistema"]),
    ("Reporte para comite", "Committee report", "Reporte para comite: status, riesgos, acciones.", ["semana"]),
  ],
  "data": [
    ("Definir metricas", "Define metrics", "Define metricas y definiciones operativas.", ["tema"]),
    ("Interpretar dashboard", "Interpret dashboard", "Interpreta dashboard y hallazgos.", ["captura_o_datos"]),
    ("SQL: generar consulta", "SQL query", "Escribe consulta SQL para este requerimiento.", ["requerimiento", "esquema"]),
    ("Analisis de cohortes", "Cohort analysis", "Propone analisis de cohortes y visuales.", ["dataset"]),
    ("Detectar anomalías", "Anomaly detection", "Identifica anomalias y posibles causas.", ["serie"]),
    ("Diccionario de datos", "Data dictionary", "Crea diccionario de datos para estas columnas.", ["columnas"]),
    ("Narrativa de datos", "Data storytelling", "Convierte resultados en narrativa ejecutiva.", ["resultados"]),
    ("Validaciones de calidad", "Data quality", "Propone reglas de calidad y tests.", ["tabla"]),
    ("Diseño de experimento", "Experiment design", "Diseña A/B test con metricas y tamaño.", ["hipotesis"]),
    ("Brief para BI", "BI brief", "Escribe brief para BI: objetivo, campos, filtros, usuarios.", ["necesidad"]),
  ],
  "finance": [
    ("Presupuesto", "Budget", "Crea presupuesto con supuestos y escenarios.", ["ingresos_gastos"]),
    ("Variaciones mes a mes", "MoM variance", "Analiza variaciones y explica drivers.", ["tabla"]),
    ("Caso de negocio", "Business case", "Business case: costo, beneficio, ROI, riesgos.", ["iniciativa"]),
    ("Política de gastos", "Expense policy", "Resume politica de gastos en bullets.", ["politica"]),
    ("Proyeccion", "Forecast", "Genera forecast con 3 escenarios.", ["historico"]),
    ("Conciliacion", "Reconciliation", "Checklist para conciliacion y controles.", ["proceso"]),
    ("Cobranza", "Collections", "Guion de cobranza respetuoso y firme.", ["caso"]),
    ("Resumen para CFO", "CFO brief", "Resumen 1 pagina: KPI, riesgos, acciones.", ["reporte"]),
    ("Analisis de costos", "Cost analysis", "Identifica oportunidades de ahorro.", ["costos"]),
    ("Control interno", "Internal controls", "Propone controles internos para este flujo.", ["flujo"]),
  ],
  "legal": [
    ("Resumen de contrato", "Contract summary", "Resume contrato: obligaciones, plazos, riesgos.", ["contrato"]),
    ("Clausulas a revisar", "Clauses to review", "Identifica clausulas criticas y preguntas.", ["contrato"]),
    ("Política de privacidad (borrador)", "Privacy policy draft", "Borrador de politica de privacidad para este caso.", ["producto"]),
    ("T&C (borrador)", "Terms draft", "Borrador de terminos y condiciones.", ["servicio"]),
    ("Respuesta a reclamo", "Complaint response", "Redacta respuesta legalmente prudente.", ["reclamo"]),
    ("Checklist compliance", "Compliance checklist", "Checklist de cumplimiento para este proceso.", ["proceso"]),
    ("Matriz de obligaciones", "Obligation matrix", "Tabla de obligaciones por parte y evidencia.", ["contrato"]),
    ("Resumen de politica interna", "Internal policy summary", "Resumen y puntos accionables.", ["politica"]),
    ("Plantilla NDA", "NDA template", "Genera plantilla NDA basica.", ["partes"]),
    ("Evaluacion de riesgo regulatorio", "Regulatory risk", "Evalua riesgo regulatorio y mitigaciones.", ["iniciativa"]),
  ],
  "hr": [
    ("Descripcion de puesto", "Job description", "Crea descripcion de puesto con competencias.", ["rol"]),
    ("Preguntas de entrevista", "Interview questions", "Genera preguntas y rubrica de evaluacion.", ["rol"]),
    ("Plan 30-60-90", "30-60-90", "Plan 30-60-90 dias para este rol.", ["rol"]),
    ("Feedback 1:1", "1:1 feedback", "Guia para dar feedback constructivo.", ["situacion"]),
    ("Encuesta interna", "Internal survey", "Propone encuesta con escalas y texto.", ["objetivo"]),
    ("Comunicado RRHH", "HR comms", "Redacta comunicado RRHH con tono humano.", ["tema"]),
    ("Plan de capacitacion", "Training plan", "Plan de capacitacion por modulos.", ["tema"]),
    ("Politica de trabajo", "Work policy", "Borrador de politica (remoto/hibrido/horarios).", ["lineamientos"]),
    ("Reconocimiento", "Recognition", "Mensaje de reconocimiento especifico.", ["logro"]),
    ("Onboarding", "Onboarding", "Checklist de onboarding y buddy plan.", ["rol"]),
  ],
  "procurement": [
    ("RFP", "RFP", "Estructura un RFP con criterios y scoring.", ["necesidad"]),
    ("Cuadro comparativo", "Vendor comparison", "Tabla comparativa: costo, alcance, riesgos.", ["propuestas"]),
    ("Correo a proveedor", "Vendor email", "Redacta correo pidiendo cotizacion con requisitos.", ["requerimiento"]),
    ("Negociacion", "Negotiation", "Estrategia de negociacion con concesiones.", ["objetivo"]),
    ("SLA", "SLA", "Define SLA propuesto (tiempos, penalidades).", ["servicio"]),
    ("Checklist de evaluacion", "Evaluation checklist", "Checklist de evaluacion tecnica y legal.", ["categoria"]),
    ("Orden de compra", "Purchase order", "Borrador de PO con items y terminos.", ["items"]),
    ("Riesgos de proveedor", "Vendor risks", "Identifica riesgos y mitigaciones.", ["proveedor"]),
    ("Plan de transicion", "Transition plan", "Plan de transicion con cutover y soporte.", ["cambio"]),
    ("Renovacion", "Renewal", "Preparar renovacion: logros, gaps, demanda.", ["contrato"]),
  ],
  "marketing": [
    ("Post LinkedIn", "LinkedIn post", "Redacta post con hook, valor y CTA.", ["tema"]),
    ("Guion video corto", "Short video script", "Guion de 30-45s con mensaje claro.", ["tema"]),
    ("Email campaña", "Campaign email", "Email de campaña con asunto y variantes.", ["oferta"]),
    ("Propuesta comercial", "Sales proposal", "Propuesta: problema, solucion, valor, precio.", ["cliente"]),
    ("Objecciones", "Objection handling", "Responde objecciones comunes con evidencias.", ["objeciones"]),
    ("One-pager", "One-pager", "One-pager de producto con beneficios y FAQ.", ["producto"]),
    ("Segmentacion", "Segmentation", "Sugiere segmentos y mensajes por segmento.", ["audiencia"]),
    ("Brief creativo", "Creative brief", "Brief: objetivo, mensaje, tono, assets.", ["campana"]),
    ("Calendario contenido", "Content calendar", "Calendario 4 semanas con temas y formatos.", ["objetivos"]),
    ("Analisis competencia", "Competitive analysis", "Analiza competidores: posicionamiento y gaps.", ["competidores"]),
  ],
}

TCREI_ES = """Usa el marco **T-C-R-E-I** para entregar una respuesta excelente.

**T (Tarea):** {task}\n
**C (Contexto):** {context}\n
**R (Reglas):**\n- Si falta informacion, lista preguntas minimas.\n- No inventes datos. Señala supuestos.\n- Usa formato solicitado.\n
**E (Ejemplo):**\n{example}\n
**I (Inputs):**\n{inputs}\n"""

TCREI_EN = """Use the **T-C-R-E-I** framework to deliver an excellent answer.

**T (Task):** {task}\n
**C (Context):** {context}\n
**R (Rules):**\n- If info is missing, list the minimum questions.\n- Don’t invent data. State assumptions.\n- Follow the requested format.\n
**E (Example):**\n{example}\n
**I (Inputs):**\n{inputs}\n"""


def make_example_es(title):
    return f"Entrada: {{...}}\nSalida: Un resultado para: {title}."

def make_example_en(title):
    return f"Input: {{...}}\nOutput: A result for: {title}."

prompts = []
idx = 1
for cat_key, cat_en, cat_es in categories:
    for title_es, title_en, task_line, vars_ in blueprints[cat_key]:
        pid = f"PR-{idx:03d}"
        inputs_es = "\n".join([f"- {{{{{v}}}}}" for v in vars_])
        inputs_en = "\n".join([f"- {{{{{v}}}}}" for v in vars_])
        prompt_es = TCREI_ES.format(
            task=task_line,
            context="Contexto Connect (operacion/office). Ajusta al pais y area cuando aplique.",
            example=make_example_es(title_es),
            inputs=inputs_es
        )
        prompt_en = TCREI_EN.format(
            task=task_line.replace("Genera", "Generate"),
            context="Connect context (ops/office). Adapt to country and team when relevant.",
            example=make_example_en(title_en),
            inputs=inputs_en
        )
        prompts.append({
            "id": pid,
            "category": {"key": cat_key, "es": cat_es, "en": cat_en},
            "title": {"es": title_es, "en": title_en},
            "tags": [cat_key, "tcrei"],
            "complexity": 2,
            "variables": vars_,
            "prompt": {"es": prompt_es, "en": prompt_en}
        })
        idx += 1

out = {
    "meta": {
        "name": "Connect Prompt Library",
        "version": "2.0",
        "count": len(prompts),
        "framework": "T-C-R-E-I",
    },
    "prompts": prompts
}

with open("/mnt/data/connect-prompts-redesign/prompts.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print("Generated", len(prompts), "prompts")
