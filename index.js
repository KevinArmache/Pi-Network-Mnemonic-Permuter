// ============================================================================
// 📦 Import des librairies nécessaires
// ============================================================================

import StellarSdk from "@stellar/stellar-sdk";
// → SDK officiel pour interagir avec le réseau Stellar (et réseaux compatibles comme Pi Network)

import bip39 from "bip39";
// → Permet de manipuler les phrases mnémoniques BIP-39 (génération, conversion en seed, etc.)

import { derivePath } from "ed25519-hd-key";
// → Sert à dériver une clé privée à partir d’une seed avec un chemin HD (Hierarchical Deterministic)

import { heapPermuteInfinite } from "./functions/heapPermuteInfinite.js";
// → Fonction personnalisée qui génère de manière infinie toutes les permutations possibles d’un tableau

// ============================================================================
// ⚙️ Configuration de base
// ============================================================================

// Tableau contenant 24 mots BIP-39 à permuter.
// Le script va changer uniquement l'ordre de ces mots et tester chaque permutation comme une phrase mnémonique complète.
const words = [
  "artist",
  "sustain",
  "frost",
  "cannon",
  "trophy",
  "immune",
  "spider",
  "render",
  "festival",
  "chimney",
  "shrimp",
  "globe",
  "gesture",
  "mango",
  "volcano",
  "hazard",
  "sheriff",
  "spike",
  "canoe",
  "bubble",
  "north",
  "pistol",
  "rocket",
  "crystal",
];

// Adresse de destination pour un éventuel transfert si un compte testé contient un solde
const DESTINATION =
  "MALYJFJ5SVD45FBWN2GT4IW67SEZ3IBOFSBSPUFCWV427NBNLG3PWAAAAAAAAIAGP5T26";

// Paramètres réseau pour se connecter au mainnet Pi Network (compatible Stellar)
const NETWORK_URL = "https://api.mainnet.minepi.com";
const NETWORK_PASSPHRASE = "Pi Network";

// Création d’un objet "server" pour communiquer avec le réseau via Horizon
const server = new StellarSdk.Horizon.Server(NETWORK_URL);

// ============================================================================
// 🛠 Variables d'état pour suivre l’exécution du script
// ============================================================================
let isRunning = false; // Pour savoir si le brute force est en cours
let currentPermutationIndex = 0; // Numéro de la permutation actuellement testée
let totalPermutationsTested = 0; // Compteur total de permutations testées

// ============================================================================
// 🔑 Fonction : Génération de la paire de clés à partir d'une permutation de mots
// ============================================================================
export async function initKeypair(words) {
  console.log("\n==================== 🔑 INITIALISATION ====================");
  console.log("🔤 Mots à tester :", words.join(" ")); // Affiche la permutation en cours

  try {
    // Convertit la phrase mnémonique en une "seed" BIP-39
    const seed = await bip39.mnemonicToSeed(words.join(" "));

    // Dérive une clé privée ed25519 avec le chemin HD spécifique à Pi Network : m/44'/314159'/0'
    const { key } = derivePath("m/44'/314159'/0'", seed);

    // Crée la paire de clés (publique + privée) Stellar/Pi à partir de la clé dérivée
    const keypair = StellarSdk.Keypair.fromRawEd25519Seed(key);

    console.log("✅ Wallet généré avec succès");
    console.log("🔑 Clé publique :", keypair.publicKey());
    console.log("========================================================\n");

    // Retourne la paire de clés et la clé publique
    return { keypair, publicKey: keypair.publicKey() };
  } catch (error) {
    // Si la phrase mnémonique est invalide, on logge et on arrête ce test
    console.log("❌ Phrase mnémonique invalide");
    return null;
  }
}

// ============================================================================
// 💰 Fonction : Récupération du solde natif (Pi/XLM) d’un compte
// ============================================================================
export async function getAccountBalance(account) {
  // Recherche dans la liste des soldes celui qui est de type "natif"
  const nativeBalance = account.balances.find(
    (b) => b.asset_type === "native"
  )?.balance;

  // Retourne le solde sous forme de nombre flottant (0 si non trouvé)
  return parseFloat(nativeBalance || "0");
}

// ============================================================================
// 💸 Fonction : Création et soumission d'une transaction de paiement
// ============================================================================
async function createAndSubmitTransaction(account, amountToSend, fee, keypair) {
  console.log("\n==================== 💸 TRANSACTION ====================");

  // Prépare la transaction avec un paiement vers l'adresse DESTINATION
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: fee.toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: DESTINATION, // Adresse destinataire
        asset: StellarSdk.Asset.native(), // Pi/XLM natif
        amount: amountToSend.toFixed(7), // Montant avec 7 décimales (format Stellar)
      })
    )
    .setTimeout(30) // La transaction expire après 30 secondes
    .build();

  // Signature de la transaction avec la clé privée générée
  transaction.sign(keypair);

  try {
    // Envoi de la transaction au réseau
    const result = await server.submitTransaction(transaction);
    console.log("✅ Transaction réussie !");
    console.log("🔗 Hash :", result.hash);
    return true;
  } catch (err) {
    // En cas d'erreur lors de la soumission
    console.error("❌ Échec de la transaction");
    const codes = err?.response?.data?.extras?.result_codes;

    // Cas fréquent : solde insuffisant ou compte verrouillé
    if (
      codes?.operations?.includes("op_underfunded") ||
      codes?.transaction === "tx_failed"
    ) {
      console.log("💸 Solde insuffisant ou wallet verrouillé");
    }

    return false;
  }
}

// ============================================================================
// 🔍 Fonction : Teste une permutation donnée
// ============================================================================
async function testWallet(words) {
  console.log(
    `\n==================== 🔍 TEST #${
      currentPermutationIndex + 1
    } ====================`
  );
  console.log("🔤 Permutation :", words.join(" "));

  // Génère la paire de clés depuis la permutation actuelle
  const keypairData = await initKeypair(words);
  if (!keypairData) return false;

  const { keypair, publicKey } = keypairData;

  try {
    // Tente de charger le compte sur Horizon
    const account = await server.loadAccount(publicKey);

    // Récupère le solde natif
    const balance = await getAccountBalance(account);
    console.log("💰 Solde :", balance.toFixed(7), "Pi");

    // Si le compte possède un solde > 0, tentative de transfert
    if (balance > 0) {
      console.log("🎉 SOLDE TROUVÉ ! Tentative de transfert...");

      // Récupère les frais de base du réseau
      const baseFee = await server.fetchBaseFee();

      // Montant à envoyer après déduction des frais et d'une marge de 1 Pi
      const amountToSend = balance - baseFee / 1e7 - 1.0;

      if (amountToSend > 0) {
        return await createAndSubmitTransaction(
          account,
          amountToSend,
          baseFee,
          keypair
        );
      } else {
        console.log("⛔ Solde insuffisant après frais");
      }
    } else {
      console.log("💤 Wallet vide");
    }
  } catch (error) {
    // Si le compte n’existe pas (erreur 404)
    if (error.response?.status === 404) {
      console.log("💤 Compte inexistant");
    } else {
      console.log("⚠️ Erreur serveur:", error.message);
    }
  }

  return false;
}

// ============================================================================
// 🚀 Fonction principale : Lance le brute force
// ============================================================================
async function runBruteForce() {
  if (isRunning) return; // Empêche de lancer plusieurs fois
  isRunning = true;

  console.log("\n==================== 🚀 DÉMARRAGE ====================");
  console.log(`🔤 ${words.length} mots à permuter`);
  console.log("====================================================\n");

  // Fonction callback appelée pour chaque permutation générée
  const processPermutation = async (permutation, index) => {
    if (!isRunning) return false;

    currentPermutationIndex = index;
    totalPermutationsTested++;

    // Affiche la progression tous les 100 tests
    if (totalPermutationsTested % 100 === 0) {
      console.log(`📊 ${totalPermutationsTested} permutations testées`);
    }

    // Teste la permutation actuelle
    const success = await testWallet(permutation);
    if (success) {
      // Si un transfert a été effectué avec succès, on arrête tout
      console.log("\n==================== 🎉 SUCCÈS ====================");
      console.log("💰 Solde trouvé et transféré !");
      console.log("🔑 Phrase secrète :", permutation.join(" "));
      console.log("====================================================\n");
      isRunning = false;
      return false;
    }

    // Petite pause entre les tests pour ne pas surcharger l’API Horizon
    await new Promise((resolve) => setTimeout(resolve, 500));

    return true; // Continue la boucle
  };

  // Lancement de l'algorithme de permutations infinies avec notre callback
  await heapPermuteInfinite(words, processPermutation);

  console.log("\n==================== 🏁 TERMINÉ ====================");
  console.log(isRunning ? "🔍 Aucun solde trouvé" : "💰 Transfert réussi !");
  console.log("==================================================\n");
}

// ============================================================================
// ▶️ Point d’entrée du script
// ============================================================================
(async () => {
  await runBruteForce();
})();
