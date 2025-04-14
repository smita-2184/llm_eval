import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Studium",
  description: "Terms and conditions for using the Studium platform",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">STUDIUM Data Collection and Processing Consent Form</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Institution and Research Team:</h2>
          <p className="mb-4">
            Humboldt-Universität zu Berlin<br />
            Fachdidaktik und Lehr-/Lernforschung Chemie<br />
            Institut für Chemie<br />
            Brook-Taylor-Str. 2<br />
            12489 Berlin, Germany
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Purpose of Data Collection:</h2>
          <p className="mb-4">
            The purpose of this study is to evaluate the impact of the Studium platform on self-regulated learning. 
            We are collecting data to understand user experiences and improve the platform. 
            All collected data will be anonymous and used solely for research purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Types of Data Collected:</h2>
          <p className="mb-2">We may collect the following types of data during the study:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>User interactions and engagement with the Studium platform</li>
            <li>Responses to surveys, questionnaires, and feedback forms</li>
            <li>Usage analytics such as time spent on the platform, frequency of access, and feature usage patterns</li>
            <li>Qualitative feedback from interviews or focus groups (if applicable)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">How Data is Collected:</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Data will be collected through voluntary user participation via surveys, questionnaires, and interaction logs on the Studium platform.</li>
            <li>No personally identifiable information (PII) will be recorded, ensuring anonymity.</li>
            <li>Participation is entirely voluntary, and users may withdraw at any time without consequences.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Data Security and Access:</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>All participants and researchers involved in the study are bound by a Non-Disclosure Agreement (NDA) to ensure confidentiality and prevent unauthorized data sharing.</li>
            <li>The data collected will be securely stored and protected.</li>
            <li>Only authorized researchers involved in this study will have access to the anonymized data.</li>
            <li>Data will not be shared with third parties or used for commercial purposes.</li>
            <li>You cannot request access to the data collected.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Retention and Deletion of Data:</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Data will be retained only for the duration necessary to complete the research analysis.</li>
            <li>All data will be permanently deleted upon completion of the study.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Your Rights as a Participant:</h2>
          <p className="mb-2">As a participant, you have the right to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Decline participation or withdraw at any time.</li>
            <li>Seek clarification on how the data will be used.</li>
          </ul>
          <p className="mb-4">
            If you have any questions or concerns about your data, please contact the research team at 
            Smita Singh (smita.singh@student.hu-berlin.de)
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Studium Platform Non-Disclosure Agreement (NDA) and Consent Statement:</h2>
          <p className="mb-4">By signing this form, you confirm that you understand and agree to the following:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>You will not share, disclose, or distribute any information related to the Studium platform, including but not limited to study materials, discussions, data, research findings, or platform functionalities, with any unauthorized individuals or third parties.</li>
            <li>You acknowledge that all data, insights, and features of the Studium platform are confidential and proprietary and solely intended for research and development purposes.</li>
            <li>You agree not to copy, reproduce, or use any part of the Studium platform, its methodology, AI models, or user interactions for any external projects, commercial use, or research without explicit written permission from the Studium research team.</li>
            <li>You acknowledge that Studium may, in the future, be developed for commercial purposes, and you will not claim any rights, ownership, or financial interests in its commercial development.</li>
            <li>You consent to the anonymous collection and processing of your data for research purposes.</li>
            <li>Any breach of this agreement may result in legal action and termination of your participation in the study.</li>
          </ul>
        </section>
      </div>
    </div>
  );
} 