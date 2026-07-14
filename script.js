const LINK_DE_PAGAMENTO = "https://mpago.la/12shRh5";

const whatsapp = "https://wa.me/5555991126008?text=Ol%C3%A1%21%20Quero%20comprar%20o%20GarantCell%20por%20R%24%2029%2C90.";

document.querySelectorAll("[data-buy]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    window.open(LINK_DE_PAGAMENTO || whatsapp, "_blank", "noopener");
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
