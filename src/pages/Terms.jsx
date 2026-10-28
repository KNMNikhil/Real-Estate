import LegalPage from "../components/LegalPage";
import { CONTACT } from "../data/contact";

// DRAFT text for review by a lawyer before launch.
export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="24 October 2026"
      intro="By using this website you agree to these terms. Please read them. If you do not agree, please do not use the site."
      sections={[
        {
          title: "About these terms",
          paragraphs: [
            "This website is run by Living Gods Real Estates, a unit of McCoy Engineering Private Limited (“we”, “us”).",
          ],
        },
        {
          title: "What we do",
          paragraphs: [
            "We help you find property to buy and help owners list property to sell. When you book, we connect you with the consultant for that area, who contacts you to arrange a meeting.",
            "A booking is a request for a meeting. It does not guarantee a sale, a purchase or a price. We are not a party to any sale between a buyer and a seller.",
          ],
        },
        {
          title: "Property listings",
          paragraphs: [
            "Listings, prices and photos are provided by property owners. We try to keep them correct, but we cannot promise that every detail is accurate or up to date. Please check the property, its papers and its price yourself before you decide.",
            "We may change or remove a listing at any time.",
          ],
        },
        {
          title: "Booking a visit",
          paragraphs: [
            "Your consultant will confirm the visit by calling you. Times may change if the consultant is not available. Any fee, if there is one, will be told to you before you agree to it.",
          ],
        },
        {
          title: "Selling a property",
          list: [
            "You confirm that you own the property or have the owner’s permission to sell it.",
            "You confirm that the details you give are true.",
            "You confirm that you have the right to use the photos you upload, and you allow us to show them on this website.",
            "The agreement (MOU) you sign with us explains how we work together. If it differs from these terms, the agreement comes first.",
          ],
        },
        {
          title: "How to use the site",
          list: [
            "Give true details, and only your own.",
            "Do not misuse the site, send spam, or try to break or get around it.",
            "Do not upload anything unlawful or that belongs to someone else.",
          ],
        },
        {
          title: "Our responsibility",
          paragraphs: [
            "The site is provided “as is”. We are not responsible for losses that come from dealings between buyers and sellers, or from relying on listing details. Nothing here limits any right you have under the law that cannot be limited.",
          ],
        },
        {
          title: "Your information",
          paragraphs: ["How we handle your personal information is explained in our Privacy Policy."],
        },
        {
          title: "Changes and law",
          paragraphs: [
            "We may update these terms. The date at the top shows the latest version. These terms are governed by the laws of India, and the courts at Chennai will handle any dispute.",
            `Questions? Email ${CONTACT.email} or call ${CONTACT.phone}.`,
          ],
        },
      ]}
    />
  );
}
