const openConsentDialogBtnClick = () => {
  window.PrivacyKit.openConsentDialog();
};

const openPrivacyPolicyBtnClick = () => {
  window.PrivacyKit.openPrivacyPolicyDialog();
};

const toggleComplianceMonitorBtnClick = () => {
  window.PrivacyKit.toggleComplianceMonitor();
};

const deleteCookiesBtnClick = () => {
  const cookies = document.cookie ? document.cookie.split(";") : [];
  const hostname = window.location.hostname;

  const domainVariants = new Set(["", hostname, `.${hostname}`]);
  const hostnameParts = hostname.split(".").filter(Boolean);
  for (let i = 0; i < hostnameParts.length - 1; i += 1) {
    const parentDomain = hostnameParts.slice(i).join(".");
    domainVariants.add(parentDomain);
    domainVariants.add(`.${parentDomain}`);
  }

  const pathVariants = new Set(["/"]);
  const pathname = window.location.pathname || "/";
  const segments = pathname.split("/").filter(Boolean);
  let cumulativePath = "";
  for (const segment of segments) {
    cumulativePath += `/${segment}`;
    pathVariants.add(cumulativePath);
    pathVariants.add(`${cumulativePath}/`);
  }

  const expirationAttributes = ["expires=Thu, 01 Jan 1970 00:00:00 GMT", "max-age=0"];
  const attributeVariants = [
    `${expirationAttributes.join("; ")}; path=/`,
    `${expirationAttributes.join("; ")}; path=/; Secure`,
    `${expirationAttributes.join("; ")}; path=/; SameSite=Lax`,
    `${expirationAttributes.join("; ")}; path=/; SameSite=None; Secure`,
  ];

  const deleteCookieEverywhere = (name) => {
    for (const path of pathVariants) {
      for (const domain of domainVariants) {
        const domainAttr = domain ? `; domain=${domain}` : "";
        document.cookie = `${name}=; ${expirationAttributes.join("; ")}; path=${path}${domainAttr};`;
        for (const attrs of attributeVariants) {
          const pathAttr = `; path=${path}`;
          const attrsWithPath = attrs.replace(/; path=\/($|;)/, `${pathAttr}$1`);
          document.cookie = `${name}=${domainAttr}; ${attrsWithPath};`;
        }
      }
    }
  };

  for (const cookie of cookies) {
    const name = cookie.split("=")[0]?.trim();
    if (!name) continue;
    deleteCookieEverywhere(name);
  }

  window.location.reload();
};

const updateScriptStatus = (elementId, granted) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.classList.toggle("card--consent-granted", Boolean(granted));
};

const renderScriptStatuses = (consent) => {
  updateScriptStatus("preferences-card", consent?.preferences);
  updateScriptStatus("analytics-card", consent?.analytics);
  updateScriptStatus("marketing-card", consent?.marketing);
  updateScriptStatus("gtm-card", consent?.analytics && consent?.marketing);
  updateScriptStatus("video-card", consent?.analytics && consent?.marketing);
};

const updateConsentState = (consent) => {
  const consentState = consent ? JSON.stringify(consent, null, 2) : "";
  const consentStateEl = document.getElementById("consent-state");
  if (!consentStateEl) return;
  consentStateEl.textContent = consentState;
};

const api = window.PrivacyKit;

/* replay safe */
api.onReady(() => {
  const consent = window.PrivacyKit.readConsent();
  updateConsentState(consent);
  renderScriptStatuses(consent);
});

api.onConsentChanged((consent) => {
  updateConsentState(consent);
  renderScriptStatuses(consent);
});

const setPreContent = (id, content) => {
  const el = document.getElementById(id);
  if (!el) return;
  // Use textContent so the markup is visible (not parsed/executed) inside the <pre>.
  el.textContent = content.trim();
};

setPreContent(
  "pre-preferences",
  `
<consent-guard consent="preferences">
  <script type="text/plain">
    window.preferencesScript = {
      message: "Preferences script loaded.",
    };
  </script>
</consent-guard>
`.trim(),
);

setPreContent(
  "pre-analytics",
  `
<consent-guard consent="analytics">
  <script type="text/plain">
    window.analyticsScript = {
      message: "Analytics script loaded.",
    };
  </script>
</consent-guard>
`.trim(),
);

setPreContent(
  "pre-marketing",
  `
<consent-guard consent="marketing">
  <script type="text/plain">
    window.marketingScript = {
      message: "Marketing script loaded.",
    };
  </script>
</consent-guard>
`.trim(),
);

setPreContent(
  "pre-gtm",
  `
<consent-guard consent="analytics+marketing">
  <script type="text/plain" data-src="https://www.googletagmanager.com/gtm.js?id=G-XZ20MQ3ZHE"></script>
</consent-guard>
`.trim(),
);

document.getElementById("try-preferences-btn-click")?.addEventListener("click", function () { alert(window.preferencesScript?.message) });
document.getElementById("try-analytics-btn-click")?.addEventListener("click", function () { alert(window.analyticsScript?.message) });
document.getElementById("try-marketing-btn-click")?.addEventListener("click", function () { alert(window.marketingScript?.message) });
document.getElementById("try-gtm-btn-click")?.addEventListener("click", function () {
  var gtmLoaded = performance.getEntriesByType('resource').some(e => e.name.includes('googletagmanager.com'));
  var gtmMessage = gtmLoaded ? "Google Tag Manager loaded." : undefined;
  alert(gtmMessage);
});

document.getElementById("open-consent-dialog")?.addEventListener("click", openConsentDialogBtnClick);
document.getElementById("open-privacy-policy")?.addEventListener("click", openPrivacyPolicyBtnClick);
document.getElementById("delete-cookies")?.addEventListener("click", deleteCookiesBtnClick);
document.getElementById("toggle-enable-compliance-monitor")?.addEventListener("click", toggleComplianceMonitorBtnClick);
