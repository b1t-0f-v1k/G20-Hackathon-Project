window.provinceMunicipalityMap = {
  "Eastern Cape": ["Buffalo City", "OR Tambo District"],
  "Free State": ["Mangaung Metro", "Thabo Mofutsanyana"],
  "Gauteng": ["City of Johannesburg", "Sedibeng District"],
  "KwaZulu-Natal": ["eThekwini Metro", "uMzinyathi District"],
  "Limpopo": ["Polokwane", "Vhembe District"],
  "Mpumalanga": ["City of Mbombela", "Gert Sibande District"],
  "Northern Cape": ["Sol Plaatje", "Namakwa District"],
  "North West": ["Rustenburg", "Ngaka Modiri Molema"],
  "Western Cape": ["City of Cape Town", "Eden District"]
};

// Populate dropdowns on page load
document.addEventListener("DOMContentLoaded", () => {
  const provinceSelect = document.getElementById("province");
  const municipalitySelect = document.getElementById("municipality");

  // Fill provinces
  provinceSelect.innerHTML = `<option value="">Select Province</option>` +
    Object.keys(window.provinceMunicipalityMap)
      .map(p => `<option value="${p}">${p}</option>`)
      .join("");

  // Province change listener
  provinceSelect.addEventListener("change", () => {
    const selectedProvince = provinceSelect.value;
    const municipalities = window.provinceMunicipalityMap[selectedProvince] || [];
    municipalitySelect.innerHTML =
      `<option value="">Select Municipality</option>` +
      municipalities.map(m => `<option value="${m}">${m}</option>`).join("");
  });
});
