/* =========================================================
   CONTACT PAGE SCRIPT
   - Pre-selects the "interested in" dropdown when arriving
     from a service link like contact.html?service=construction
   - Shows a status message on form submit (Web3Forms-ready)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Pre-fill interest dropdown from ?service= param ---- */
  const params = new URLSearchParams(window.location.search);
  const service = params.get('service');
  const interestSelect = document.getElementById('interest');

  const serviceMap = {
    'real-estate': 'Real Estate',
    'construction': 'Construction',
    'brand': 'Brand Promotions',
    'social': 'Social Media Management'
  };

  if (service && interestSelect && serviceMap[service]) {
    interestSelect.value = serviceMap[service];
  }

  /* ---- Form submit feedback ---- */
  const form = document.getElementById('enquiryForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  form.addEventListener('submit', async (e) => {
    const accessKey = form.querySelector('[name="access_key"]').value;

    // If the placeholder key hasn't been replaced yet, don't attempt
    // a real submission — just let the user know what to do.
    if (accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      e.preventDefault();
      status.textContent = 'Form not yet connected — add your Web3Forms access key in contact.html to activate.';
      return;
    }

    e.preventDefault();
    status.textContent = 'Sending...';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      const result = await response.json();

      if (result.success) {
        status.textContent = 'Thank you — we\u2019ve received your enquiry and will call you back shortly.';
        form.reset();
      } else {
        status.textContent = 'Something went wrong. Please call us directly at 95500-60033.';
      }
    } catch (err) {
      status.textContent = 'Network error. Please call us directly at 95500-60033.';
    }
  });

});
