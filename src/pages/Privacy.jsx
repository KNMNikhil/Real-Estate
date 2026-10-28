import LegalPage from "../components/LegalPage";
import { CONTACT } from "../data/contact";

// DRAFT text for review by a lawyer before launch.
export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="24 October 2026"
      intro="This page explains what information Living Gods Real Estates collects, why we collect it, and the choices you have. We keep it short and plain."
      sections={[
        {
          title: "Who we are",
          paragraphs: [
            "Living Gods Real Estates is a unit of McCoy Engineering Private Limited (“we”, “us”). We help people buy, sell and manage property through our area consultants.",
          ],
        },
        {
          title: "What we collect",
          list: [
            "Your name, email address and phone number when you book a visit, sell a property or send us a message.",
            "Property details and photos that you add when you list a property.",
            "The message you write on the Contact page.",
            "For consultants: contact number and a password (stored in scrambled form, never as plain text).",
          ],
        },
        {
          title: "How we use it",
          list: [
            "To contact you about your booking or enquiry.",
            "To arrange a meeting with the consultant for your area.",
            "To show your property listing on our website.",
            "To reply to your messages and keep our service working.",
          ],
          paragraphs: ["We do not sell your information."],
        },
        {
          title: "Who can see it",
          list: [
            "The consultant you book with, so they can call you.",
            "Our team, when they need it to help you.",
            "Our service providers: Supabase (database) and Vercel (website hosting).",
            "Visitors to the website can see the details and photos of a listed property. They cannot see your phone number or email.",
          ],
        },
        {
          title: "How we protect it",
          paragraphs: [
            "Your details are kept in a protected database. Only the consultant you booked with can see your contact details. No online system is perfectly secure, but we take care to limit who can reach your information.",
          ],
        },
        {
          title: "How long we keep it",
          paragraphs: [
            "We keep your information for as long as we need it to deal with your booking or enquiry, and as the law requires. After that we delete it or remove your personal details.",
          ],
        },
        {
          title: "Your choices",
          paragraphs: [
            `You can ask us to show you what we hold about you, correct it, or delete it, and you can take back your consent at any time. Write to us at ${CONTACT.email} and we will help.`,
          ],
        },
        {
          title: "Cookies",
          paragraphs: [
            "We do not use advertising or tracking cookies. Your browser may store small bits of information that the site needs to work, such as keeping a consultant signed in.",
          ],
        },
        {
          title: "Who this is for",
          paragraphs: ["Our service is meant for people aged 18 and over."],
        },
        {
          title: "Changes and contact",
          paragraphs: [
            "If we change this policy, we will update the date at the top of this page.",
            `Questions? Email ${CONTACT.email} or call ${CONTACT.phone}.`,
          ],
        },
      ]}
    />
  );
}
