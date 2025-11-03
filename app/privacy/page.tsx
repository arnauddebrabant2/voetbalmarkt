'use client'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto p-8 space-y-6 text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold text-[#F59E0B] mb-4">
        Privacyverklaring — VoetbalMarkt
      </h1>

      <p>
        Deze privacyverklaring legt uit hoe <strong>VoetbalMarkt</strong> omgaat
        met jouw persoonsgegevens. Wij vinden jouw privacy belangrijk en gaan
        zorgvuldig om met alle informatie die jij met ons deelt.
      </p>

      <section>
        <h2 className="text-xl font-semibold text-[#F59E0B] mb-2">
          1. Wie is verantwoordelijk?
        </h2>
        <p>
          VoetbalMarkt is verantwoordelijk voor de verwerking van gegevens op
          dit platform. Voor vragen of verzoeken kan je contact opnemen via:{' '}
          <a
            href="mailto:privacy@voetbalmarkt.be"
            className="text-[#F59E0B] underline"
          >
            privacy@voetbalmarkt.be
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[#F59E0B] mb-2">
          2. Welke gegevens verzamelen we?
        </h2>
        <p>
          Wanneer je een account aanmaakt of een spelersprofiel invult, kunnen
          we volgende gegevens opslaan:
        </p>
        <ul className="list-disc list-inside ml-4">
          <li>Naam of weergavenaam</li>
          <li>Leeftijd</li>
          <li>Provincie / regio</li>
          <li>Voet (links/rechts/beide)</li>
          <li>Posities (favoriete en tweede positie)</li>
          <li>Niveau en gewenste competitie</li>
          <li>Bio / beschrijving</li>
          <li>Loopbaan (carrière-overzicht)</li>
          <li>Sterktes (zoals techniek, snelheid, inzicht...)</li>
          <li>Beschikbaarheidsdatum</li>
        </ul>
        <p className="mt-2">
          Deze informatie wordt uitsluitend gebruikt om spelers en clubs beter
          met elkaar te verbinden.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[#F59E0B] mb-2">
          3. Waarom verwerken we deze gegevens?
        </h2>
        <p>
          We gebruiken jouw gegevens om jouw profiel weer te geven op het
          platform, zodat clubs en andere spelers jou kunnen vinden. Enkel de
          informatie die jij zelf toevoegt, wordt zichtbaar gemaakt.
        </p>
        <p className="mt-2">
          Als je ervoor kiest om je profiel te verbergen, is het niet meer
          zichtbaar in de spelerslijst.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[#F59E0B] mb-2">
          4. Delen we gegevens met derden?
        </h2>
        <p>
          Nee. VoetbalMarkt verkoopt, verhuurt of deelt geen persoonsgegevens
          met derden. Alleen jij bepaalt welke informatie zichtbaar is voor
          andere gebruikers.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[#F59E0B] mb-2">
          5. Waar worden de gegevens bewaard?
        </h2>
        <p>
          Alle gegevens worden veilig opgeslagen bij{' '}
          <strong>Supabase</strong>, een Europese clouddienst met servers binnen
          de EU. Toegang is enkel toegestaan via beveiligde verbindingen (HTTPS)
          en geauthenticeerde gebruikers.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[#F59E0B] mb-2">
          6. Jouw rechten (AVG / GDPR)
        </h2>
        <p>Je hebt het recht om:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Je gegevens in te zien</li>
          <li>Je gegevens te laten wijzigen of verwijderen</li>
          <li>Je profiel onzichtbaar te maken</li>
          <li>Je account te verwijderen</li>
        </ul>
        <p className="mt-2">
          Wil je gebruikmaken van één van deze rechten? Stuur ons een e-mail via{' '}
          <a
            href="mailto:privacy@voetbalmarkt.be"
            className="text-[#F59E0B] underline"
          >
            privacy@voetbalmarkt.be
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[#F59E0B] mb-2">
          7. Bewaartermijn
        </h2>
        <p>
          We bewaren jouw gegevens zolang je account actief is. Als je je
          account verwijdert, wordt alle informatie permanent verwijderd uit de
          database.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[#F59E0B] mb-2">
          8. Beveiliging
        </h2>
        <p>
          We nemen passende technische maatregelen om jouw gegevens te
          beschermen. Alleen jij hebt toegang tot jouw profiel en enkel jij kan
          het aanpassen of verwijderen.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[#F59E0B] mb-2">
          9. Wijzigingen
        </h2>
        <p>
          We kunnen deze privacyverklaring aanpassen als onze werking wijzigt.
          De meest recente versie is altijd te vinden op deze pagina.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[#F59E0B] mb-2">
          10. Cookies
        </h2>
        <p>
          VoetbalMarkt gebruikt enkel functionele cookies die nodig zijn om
          gebruikers ingelogd te houden en de site correct te laten werken.
          Er worden geen marketing- of trackingcookies gebruikt.
        </p>
      </section>


      <div className="pt-6">
        <Link
          href="/"
          className="inline-block bg-[#F59E0B] hover:bg-[#D97706] text-white px-5 py-2 rounded-lg shadow"
        >
          ← Terug naar home
        </Link>
      </div>
    </main>
  )
}
