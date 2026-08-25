const domainsSet = new Set();

async function getDomains() {
  const response = await fetch("/domain", { method: "GET" }).catch((err) =>
    console.err(),
  );

  if (!response.ok) return;

  const data = await response.json();
  const mappedData = data.map((d) => {
    if (d.domain) {
      return d.domain;
    }
  });

  return mappedData;
}

async function removeDomain(domain) {
  if (typeof domain !== "string")
    throw new Error(
      "[removeDomain] argument domain must be type of << string >>",
    );

  const body = {
    domain,
  };

  const response = await fetch("/domain", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).catch((err) => console.err());

  if (!response.ok) return;

  domainsSet.delete(domain);
  await loadDomains(domainsSet);
}

function createDomainItemElement(domain) {
  const blockedDomainsItem = document.createElement("li");
  blockedDomainsItem.innerText = domain;

  const removeDomainButton = document.createElement("button");
  removeDomainButton.innerText = "remove";
  removeDomainButton.addEventListener("click", () => removeDomain(domain));

  blockedDomainsItem.appendChild(removeDomainButton);

  return blockedDomainsItem;
}

async function loadDomains(domains) {
  const blockedDomainsList = document.getElementById("blockedDomainsList");
  if (!blockedDomainsList) return;

  blockedDomainsList.innerHTML = "";

  for (domain of domains) {
    const blockedDomainsItem = createDomainItemElement(domain);
    blockedDomainsList.appendChild(blockedDomainsItem);
  }
}

async function addDomain(e) {
  e.preventDefault();
  const form = e.target;

  const formData = new FormData(form);
  const obj = Object.fromEntries(formData);
  const json = JSON.stringify(obj);

  try {
    const response = await fetch("/domain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: json,
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    form.reset();
    domainsSet.add(formData.get("domain"));
    await loadDomains(domainsSet);
  } catch (error) {
    console.error(error.message);
  }
}

async function init() {
  const domainForm = document.getElementById("domainForm");
  if (domainForm) {
    domainForm.addEventListener("submit", addDomain);
  }

  getDomains().then((domains) => {
    for (domain of domains) {
      domainsSet.add(domain);
    }

    loadDomains(domains);
  });
}

document.addEventListener("DOMContentLoaded", init);
