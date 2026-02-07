const STORAGE_KEY = "clinicaApiConfig";

const defaultConfig = {
  patientsApi: "",
  triagesApi: "",
};

const configInput = {
  patients: document.getElementById("patientsApi"),
  triages: document.getElementById("triagesApi"),
  save: document.getElementById("saveApiConfig"),
  hint: document.getElementById("apiConfigHint"),
};

const tabs = document.querySelectorAll(".tab");
const sections = document.querySelectorAll(".section");

const patientForm = document.getElementById("patientForm");
const patientMessage = document.getElementById("patientMessage");
const updatePatientBtn = document.getElementById("updatePatient");
const findPatientBtn = document.getElementById("findPatient");
const deletePatientBtn = document.getElementById("deletePatient");

const triajeForm = document.getElementById("triajeForm");
const triajeMessage = document.getElementById("triajeMessage");
const loadPatientBtn = document.getElementById("loadPatient");
const patientPreview = document.getElementById("patientPreview");

const consultaDni = document.getElementById("consultaDni");
const searchTriagesBtn = document.getElementById("searchTriages");
const triajeList = document.getElementById("triajeList");
const triajeDetail = document.getElementById("triajeDetail");
const consultaMessage = document.getElementById("consultaMessage");

const steps = document.querySelectorAll(".form-step");
const stepButtons = document.querySelectorAll(".step");
const nextStepBtn = document.getElementById("nextStep");
const prevStepBtn = document.getElementById("prevStep");
let currentStep = 1;

const loadConfig = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { ...defaultConfig };
  }
  try {
    return { ...defaultConfig, ...JSON.parse(stored) };
  } catch (error) {
    return { ...defaultConfig };
  }
};

const saveConfig = (config) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  configInput.hint.textContent = "Configuracion guardada.";
};

const getConfig = () => {
  const config = loadConfig();
  if (!config.patientsApi || !config.triagesApi) {
    configInput.hint.textContent =
      "Completa las URLs de API antes de registrar datos.";
  }
  return config;
};

const formatDateTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString("es-PE");
};

const showMessage = (element, message, isError = false) => {
  element.textContent = message;
  element.style.color = isError ? "#ff6b6b" : "#ffb454";
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data.message || "Error en la solicitud";
    throw new Error(msg);
  }
  return data;
};

const setActiveTab = (targetId) => {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.target === targetId));
  sections.forEach((section) => section.classList.toggle("active", section.id === targetId));
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveTab(tab.dataset.target));
});

const applyStep = (step) => {
  currentStep = step;
  steps.forEach((item) => item.classList.toggle("active", Number(item.dataset.step) === step));
  stepButtons.forEach((btn) => btn.classList.toggle("active", Number(btn.dataset.step) === step));
};

stepButtons.forEach((btn) => {
  btn.addEventListener("click", () => applyStep(Number(btn.dataset.step)));
});

nextStepBtn.addEventListener("click", () => {
  if (currentStep < 3) applyStep(currentStep + 1);
});

prevStepBtn.addEventListener("click", () => {
  if (currentStep > 1) applyStep(currentStep - 1);
});

const collectPatientData = () => {
  const formData = new FormData(patientForm);
  return Object.fromEntries(formData.entries());
};

const clearPatientForm = () => {
  patientForm.reset();
  applyStep(1);
};

const updatePatientForm = (data) => {
  Object.entries(data).forEach(([key, value]) => {
    const field = patientForm.querySelector(`[name="${key}"]`);
    if (field) {
      field.value = value || "";
    }
  });
};

patientForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const config = getConfig();
  const payload = collectPatientData();
  if (!config.patientsApi) {
    showMessage(patientMessage, "Configura la API de pacientes.", true);
    return;
  }
  try {
    await fetchJson(`${config.patientsApi}/pacientes`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    showMessage(patientMessage, "Paciente registrado correctamente.");
    clearPatientForm();
  } catch (error) {
    showMessage(patientMessage, error.message, true);
  }
});

updatePatientBtn.addEventListener("click", async () => {
  const config = getConfig();
  const payload = collectPatientData();
  if (!payload.dni) {
    showMessage(patientMessage, "Ingresa DNI para actualizar.", true);
    return;
  }
  try {
    await fetchJson(`${config.patientsApi}/pacientes/${payload.dni}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    showMessage(patientMessage, "Paciente actualizado.");
  } catch (error) {
    showMessage(patientMessage, error.message, true);
  }
});

findPatientBtn.addEventListener("click", async () => {
  const config = getConfig();
  const dni = document.getElementById("dni").value.trim();
  if (!dni) {
    showMessage(patientMessage, "Ingresa DNI para buscar.", true);
    return;
  }
  try {
    const data = await fetchJson(`${config.patientsApi}/pacientes/${dni}`);
    updatePatientForm(data);
    showMessage(patientMessage, "Paciente encontrado.");
  } catch (error) {
    showMessage(patientMessage, error.message, true);
  }
});

deletePatientBtn.addEventListener("click", async () => {
  const config = getConfig();
  const dni = document.getElementById("dni").value.trim();
  if (!dni) {
    showMessage(patientMessage, "Ingresa DNI para eliminar.", true);
    return;
  }
  try {
    await fetchJson(`${config.patientsApi}/pacientes/${dni}`, {
      method: "DELETE",
    });
    showMessage(patientMessage, "Paciente eliminado.");
    clearPatientForm();
  } catch (error) {
    showMessage(patientMessage, error.message, true);
  }
});

loadPatientBtn.addEventListener("click", async () => {
  const config = getConfig();
  const dni = document.getElementById("triajeDni").value.trim();
  if (!dni) {
    showMessage(triajeMessage, "Ingresa DNI para buscar.", true);
    return;
  }
  try {
    const data = await fetchJson(`${config.patientsApi}/pacientes/${dni}`);
    patientPreview.textContent = `${data.nombres || ""} ${data.apellidos || ""}`.trim();
    showMessage(triajeMessage, "Paciente cargado.");
  } catch (error) {
    patientPreview.textContent = "";
    showMessage(triajeMessage, error.message, true);
  }
});

triajeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const config = getConfig();
  const dni = document.getElementById("triajeDni").value.trim();
  if (!dni) {
    showMessage(triajeMessage, "Ingresa DNI del paciente.", true);
    return;
  }
  const formData = new FormData(triajeForm);
  const payload = Object.fromEntries(formData.entries());
  payload.dni = dni;

  try {
    await fetchJson(`${config.triagesApi}/triajes`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    showMessage(triajeMessage, "Triaje registrado correctamente.");
    triajeForm.reset();
  } catch (error) {
    showMessage(triajeMessage, error.message, true);
  }
});

searchTriagesBtn.addEventListener("click", async () => {
  const config = getConfig();
  const dni = consultaDni.value.trim();
  if (!dni) {
    showMessage(consultaMessage, "Ingresa DNI para consultar.", true);
    return;
  }
  try {
    const data = await fetchJson(`${config.triagesApi}/triajes?dni=${encodeURIComponent(dni)}`);
    renderTriageList(data.items || []);
    showMessage(consultaMessage, data.items?.length ? "" : "No hay triajes.");
  } catch (error) {
    renderTriageList([]);
    showMessage(consultaMessage, error.message, true);
  }
});

const renderTriageList = (items) => {
  triajeList.innerHTML = "";
  triajeDetail.textContent = "";
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <div>
        <strong>${item.dni}</strong>
        <div>${formatDateTime(item.fechaHora)}</div>
      </div>
      <button class="btn btn-ghost" data-dni="${item.dni}" data-fecha="${item.fechaHora}">
        Ver detalle
      </button>
    `;
    row.querySelector("button").addEventListener("click", () => {
      loadTriageDetail(item.dni, item.fechaHora);
    });
    triajeList.appendChild(row);
  });
};

const loadTriageDetail = async (dni, fechaHora) => {
  const config = getConfig();
  try {
    const data = await fetchJson(
      `${config.triagesApi}/triajes/${encodeURIComponent(dni)}/${encodeURIComponent(fechaHora)}`
    );
    triajeDetail.innerHTML = `
      <div><strong>DNI:</strong> ${data.dni}</div>
      <div><strong>Fecha:</strong> ${formatDateTime(data.fechaHora)}</div>
      <div><strong>Presion arterial:</strong> ${data.presionArterial}</div>
      <div><strong>Frecuencia cardiaca:</strong> ${data.frecuenciaCardiaca}</div>
      <div><strong>Saturacion oxigeno:</strong> ${data.saturacionOxigeno}</div>
      <div><strong>Temperatura corporal:</strong> ${data.temperaturaCorporal}</div>
      <div><strong>Peso (kg):</strong> ${data.pesoKg}</div>
      <div><strong>Talla (m):</strong> ${data.tallaM}</div>
    `;
  } catch (error) {
    triajeDetail.textContent = error.message;
  }
};

configInput.save.addEventListener("click", () => {
  const config = {
    patientsApi: configInput.patients.value.trim(),
    triagesApi: configInput.triages.value.trim(),
  };
  saveConfig(config);
});

const initializeConfigInputs = () => {
  const config = loadConfig();
  configInput.patients.value = config.patientsApi || "";
  configInput.triages.value = config.triagesApi || "";
};

initializeConfigInputs();
applyStep(1);
