# Brand Selector - Implementare

## Descriere
S-a implementat un sistem complet pentru gestionarea mărcilor de mașini în formularele de adăugare și editare anunțuri (vânzări și închirieri).

## Funcționalități implementate

### 1. Component BrandSelector
- **Locație**: `src/components/BrandSelector.tsx`
- **Funcționalități**:
  - Dropdown pentru selectarea mărcilor existente
  - Câmp text pentru adăugarea mărcilor noi
  - Validare pentru a preveni completarea ambelor câmpuri
  - Design responsive și modern
  - Suport pentru teme întunecate

### 2. Utilitare pentru mărci
- **Locație**: `src/utils/apiBrands.ts`
- **Funcționalități**:
  - `getBrands()` - Obține toate mărcile din Firestore
  - `addBrand()` - Adaugă o marcă nouă
  - `checkBrandExists()` - Verifică dacă o marcă există deja
  - `getBrandById()` - Obține o marcă după ID

### 3. Hook personalizat
- **Locație**: `src/hooks/useBrands.ts`
- **Funcționalități**:
  - Gestionarea stării mărcilor
  - Încărcarea automată la montarea componentei
  - Funcții pentru adăugare și verificare

### 4. Integrare în formulare
Formularele actualizate:
- `src/app/admin/add/page.tsx` - Adăugare mașini (vânzări)
- `src/app/admin/rentals/add/page.tsx` - Adăugare închirieri
- `src/app/admin/edit/[id]/EditClient.tsx` - Editare mașini
- `src/app/admin/rentals/edit/[id]/page.tsx` - Editare închirieri

### 5. Stiluri CSS
- **Locație**: `src/app/globals.css`
- **Caracteristici**:
  - Design responsive
  - Suport pentru teme întunecate
  - Stiluri pentru input groups și butoane
  - Media queries pentru mobile

### 6. Securitate Firestore
- **Locație**: `firestore.rules`
- **Reguli**:
  - Citire publică pentru mărcile
  - Scriere doar pentru utilizatorii autentificați

## Structura colecției Firestore

### Colecția `brands`
```javascript
{
  id: "auto-generated",
  name: "BMW",
  createdAt: Timestamp
}
```

## Validări implementate

1. **Obligatoriu**: Adminul trebuie să selecteze o marcă existentă SAU să adauge una nouă
2. **Exclusivitate**: Nu se pot completa ambele opțiuni simultan
3. **Duplicate**: Verificare case-insensitive pentru mărci existente
4. **Format**: Numele mărcii este trimat automat

## Mesaje de eroare

- "Alege o singură opțiune pentru marcă" - când sunt completate ambele câmpuri
- "Marca este obligatorie" - când nu este selectată nicio opțiune
- "Această marcă există deja" - când se încearcă adăugarea unei mărci duplicate
- "Introduceți numele mărcii" - când câmpul pentru marcă nouă este gol

## Responsive Design

- **Desktop**: Layout orizontal cu radio buttons inline
- **Mobile**: Layout vertical cu radio buttons pe blocuri separate
- **Input groups**: Adaptare pentru ecrane mici

## Compatibilitate

- ✅ Formulare de adăugare mașini (vânzări)
- ✅ Formulare de adăugare închirieri
- ✅ Formulare de editare mașini
- ✅ Formulare de editare închirieri
- ✅ Design responsive
- ✅ Suport pentru teme întunecate
- ✅ Validări complete
- ✅ Securitate Firestore

## Utilizare

1. Adminul accesează un formular de adăugare/editare
2. În secțiunea "Marcă" găsește două opțiuni:
   - Radio button "Alege marcă existentă" cu dropdown
   - Radio button "Adaugă marcă nouă" cu câmp text
3. Selectează una din opțiuni și completează câmpul corespunzător
4. La adăugarea unei mărci noi, aceasta este salvată automat în colecția `brands`
5. Mărcile rămân în colecție chiar dacă anunțul este șters

## Note tehnice

- Mărcile sunt ordonate alfabetic în dropdown
- Verificarea duplicatelor este case-insensitive
- Numele mărcilor sunt trimate automat (trim)
- Colecția `brands` este partajată între toți adminii
 