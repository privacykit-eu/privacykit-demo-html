const getConsentDialog = () => document.querySelector("consent-dialog");

const openConsentDialog = () => {
  const consentDialog = getConsentDialog();
  if (!consentDialog || typeof consentDialog.openDialog !== "function") return;
  consentDialog.openDialog();
};

const openPrivacyPolicy = () => {
  const consentDialog = getConsentDialog();
  if (!consentDialog || typeof consentDialog.openPrivacyPolicyDialog !== "function") return;
  consentDialog.openPrivacyPolicyDialog();
};

const deleteCookies = () => {
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
  updateScriptStatus("video-card", consent?.analytics && consent?.marketing);
};

const updateConsentState = (consent) => {
  const consentState = consent ? JSON.stringify(consent, null, 2) : "";
  const consentStateEl = document.getElementById("consent-state");
  if (!consentStateEl) return;
  consentStateEl.textContent = consentState;
};

window.addEventListener('privacykit:ready', () => {
  const consent = window.PrivacyKit.readConsent();
  updateConsentState(consent);
  renderScriptStatuses(consent);
});

window.addEventListener("privacykit:consent-changed", () => {
  const consent = window.PrivacyKit.readConsent();
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

document.getElementById("try-preferences-btn-click")?.addEventListener("click", function () { alert(window.preferencesScript?.message) });
document.getElementById("try-analytics-btn-click")?.addEventListener("click", function () { alert(window.analyticsScript?.message) });
document.getElementById("try-marketing-btn-click")?.addEventListener("click", function () { alert(window.marketingScript?.message) });

document.getElementById("open-consent-dialog")?.addEventListener("click", openConsentDialog);
document.getElementById("open-privacy-policy")?.addEventListener("click", openPrivacyPolicy);
document.getElementById("delete-cookies")?.addEventListener("click", deleteCookies);
