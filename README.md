# Pi/Stellar Mnemonic Permuter

🌍 [Français](#-français) | [English](#-english)

---

## 🇫🇷 Français

### Pi/Stellar Mnemonic Permuter (Éducatif)

Un script Node.js qui génère une seed à partir d’une phrase mnémonique, dérive une clé ed25519 (chemin HD spécifique à Pi/Stellar), interroge Horizon pour lire le solde du compte correspondant et, si un solde est trouvé, tente (optionnellement) un transfert vers une adresse définie.  
Le programme parcourt en continu toutes les permutations possibles d’une liste de 24 mots fournie en entrée.

> ⚠️ **Usage strictement éducatif** — N’utilise jamais ce code pour accéder à des comptes tiers. Privilégie le **testnet** et garde l’envoi de transaction désactivé lors de l’apprentissage.

---

### Fonctionnalités

- 🔤 **Permutation infinie** d’une liste de 24 mots (ordre uniquement).
- 🔑 Génération de seed BIP-39 et dérivation via le chemin `m/44'/314159'/0'`.
- 🛰️ Connexion à un nœud Horizon (Pi/Stellar) pour interroger un compte.
- 💰 Lecture du solde natif du compte.
- 💸 Transaction optionnelle vers une adresse cible si solde suffisant (désactivable).
- 📊 Logs complets : progression, index de permutation, soldes, résultats de transaction.
- ⏳ Pause configurable entre les tests pour respecter les limites d’API.

---

### Avertissement légal & éthique

- Ce projet est destiné **uniquement** à l’apprentissage des standards BIP-39, de la dérivation ed25519 et de l’API Horizon.
- N’utilise que des **comptes personnels** ou **comptes testnet**.
- Toute tentative d’accès à des fonds tiers est illégale.
- L’auteur décline toute responsabilité en cas d’abus.

---

### Pourquoi le brute force est irréaliste

La liste BIP-39 comporte **2048 mots**.  
Une phrase de 24 mots avec seulement un changement d’ordre donne **24! ≈ 6,204 × 10²³ permutations**.  
Même avec des millions de tests par seconde, il faudrait bien plus que l’âge de l’univers pour couvrir l’espace complet.

---

### 🚨 Scam Alert

- Des scripts “miracles” circulent, affichant des clés menant à des comptes contrôlés par les arnaqueurs.
- Les comptes affichent parfois de l’USDT mais aucun Pi/Lumen pour payer les frais, incitant à en envoyer — les fonds sont alors siphonnés.
- Certains scripts contiennent des malwares.
- **Toujours** lire et comprendre le code avant exécution.

---

### Prérequis

- Node.js 18+
- NPM / PNPM / Yarn

---

### Installation

```bash
git clone <repo>
cd <repo>
npm install
```

---

### Configuration

Dans le script :

- **Liste de mots** : tes 24 mots BIP-39 (ou mots de test).
- **Chemin HD** : `m/44'/314159'/0'` (Pi/Stellar).
- **Horizon** :
  - **Testnet recommandé** :
    ```js
    const NETWORK_URL = "https://horizon-testnet.stellar.org";
    const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
    ```
  - **Mainnet Pi** : `https://api.mainnet.minepi.com` (à éviter pour l’apprentissage).
- **Adresse de destination** : une adresse de test ou ton propre compte testnet.
- **Pause entre tests** : ajustable pour limiter la charge sur l’API.

---

### Lancement

```bash
node index.js
```

**Processus** :

1. Combine les 24 mots en phrase mnémonique.
2. Génère la seed et dérive la clé publique.
3. Charge le compte sur Horizon.
4. Lit le solde natif :
   - 0 Pi → passe à la permutation suivante.
   - > 0 Pi → tente (optionnellement) un transfert.
5. Continue indéfiniment via `heapPermuteInfinite`.

---

### Exemple de sortie

```
==================== 🚀 DÉMARRAGE ====================
🔤 24 mots à permuter

==================== 🔍 TEST #42 ====================
🔤 Permutation : artist sustain ... crystal
✅ Wallet généré
🔑 Clé publique : GABC...XYZ
💤 Compte inexistant

📊 100 permutations testées
```

---

### Bonnes pratiques

- Utilise **toujours** le testnet pour apprendre.
- Garde l’option **DRY_RUN** activée pour bloquer les transactions.
- Évite de réduire trop la pause entre tests.
- Ne partage jamais tes seeds ou clés privées.

---

### Limites & performances

- Appels Horizon soumis à des limites de requêtes.
- L’espace de recherche reste astronomique.
- Les appels réseau dominent le temps d’exécution.

---

### Licence

MIT — Utilisation responsable exigée.

---

## 🇬🇧 English

### Pi/Stellar Mnemonic Permuter (Educational)

A Node.js script that generates a seed from a mnemonic phrase, derives an ed25519 key (Pi/Stellar-specific HD path), queries Horizon to read the account’s native balance and, if funds are found, optionally attempts a transfer to a specified address.  
The program continuously iterates over all permutations of a 24-word list provided as input.

> ⚠️ **Educational use only** — Never use this code to access third-party accounts. Prefer **testnet** and keep transaction submission disabled while learning.

---

### Features

- 🔤 **Endless permutation** of a 24-word list (order only).
- 🔑 BIP-39 seed generation and derivation via path `m/44'/314159'/0'`.
- 🛰️ Horizon (Pi/Stellar) connection to query an account.
- 💰 Reads the account’s native balance.
- 💸 Optional transaction to a target address if balance is sufficient (toggleable).
- 📊 Detailed logs: progress, permutation index, balances, transaction results.
- ⏳ Configurable delay between tests to respect API rate limits.

---

### Legal & Ethical Notice

- This project is for **learning purposes only** (BIP-39, ed25519 derivation, Horizon API).
- Use **your own accounts** or **testnet accounts** only.
- Any attempt to access third-party funds is illegal.
- The author disclaims all responsibility for misuse.

---

### Why brute force is unrealistic

The BIP-39 list has **2048 words**.  
A 24-word phrase with order variations only still yields **24! ≈ 6.204 × 10²³ permutations**.  
Even at millions of tests per second, this far exceeds the age of the universe to exhaust.

---

### 🚨 Scam Alert

- “Magic” scripts often reveal keys to accounts controlled by scammers.
- Such accounts may show USDT but have no Pi/Lumen for fees, baiting you to fund gas — funds get siphoned.
- Some scripts embed malware.
- **Always** read and understand the code before running it.

---

### Prerequisites

- Node.js 18+
- NPM / PNPM / Yarn

---

### Installation

```bash
git clone <repo>
cd <repo>
npm install
```

---

### Configuration

Inside the script:

- **Word list**: your 24 BIP-39 words (or test words).
- **HD path**: `m/44'/314159'/0'` (Pi/Stellar).
- **Horizon**:
  - **Recommended testnet**:
    ```js
    const NETWORK_URL = "https://horizon-testnet.stellar.org";
    const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
    ```
  - **Pi mainnet**: `https://api.mainnet.minepi.com` (avoid while learning).
- **Destination address**: a test address or your own testnet account.
- **Delay between tests**: adjustable to limit API load.

---

### Run

```bash
node index.js
```

**Process**:

1. Join the 24 words into a mnemonic phrase.
2. Generate the seed and derive the public key.
3. Load the account via Horizon.
4. Read the native balance:
   - 0 Pi → proceed to the next permutation.
   - > 0 Pi → (optionally) attempt a transfer.
5. Continue indefinitely using `heapPermuteInfinite`.

---

### Sample Output

```
==================== 🚀 START ====================
🔤 24 words to permute

==================== 🔍 TEST #42 ====================
🔤 Permutation: artist sustain ... crystal
✅ Wallet generated
🔑 Public key: GABC...XYZ
💤 Account not found

📊 100 permutations tested
```

---

### Best Practices

- **Always** use testnet while learning.
- Keep **DRY_RUN** enabled to block transactions.
- Don’t reduce the delay too aggressively.
- Never share your seeds or private keys.

---

### Limits & Performance

- Horizon calls are rate-limited.
- The search space is astronomical.
- Network I/O dominates runtime.

---

### License

MIT — Responsible use required.
