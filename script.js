// COLE O LINK DE PAGAMENTO DO ASAAS ABAIXO QUANDO ELE ESTIVER PRONTO.
const LINK_DE_PAGAMENTO = "";

document.querySelectorAll(".payment-link").forEach((button) => {
  button.addEventListener("click", (event) => {
    if (!LINK_DE_PAGAMENTO) {
      const placeholder = button.dataset.paymentPlaceholder === "true";
      if (placeholder) {
        event.preventDefault();
        alert("O link de pagamento do Asaas ainda será adicionado. Enquanto isso, fale conosco pelo WhatsApp.");
        window.open("https://wa.me/5555991126008?text=Ol%C3%A1%21%20Quero%20comprar%20o%20GarantCell%20por%20R%24%2029%2C90.", "_blank");
      }
      return;
    }

    event.preventDefault();
    window.open(LINK_DE_PAGAMENTO, "_blank", "noopener");
  });
});
