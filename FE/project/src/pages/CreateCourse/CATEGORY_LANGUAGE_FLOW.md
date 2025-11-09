# Category & Language - Data Flow

## 📊 Data Source (constants/categories.ts)

```typescript
export const CATEGORIES = [
  { id: '1', name: 'IELTS' },
  { id: '2', name: 'TOEIC' },
  { id: '3', name: 'JLPT' },
  { id: '4', name: 'TOPIK' },
  { id: '5', name: 'HSK' },
];

export const LANGUAGES = [
  { id: '1', name: 'English', code: 'en' },
  { id: '2', name: 'Vietnamese', code: 'vi' },
  { id: '3', name: 'Chinese', code: 'zh' },
  { id: '4', name: 'Japanese', code: 'ja' },
  { id: '5', name: 'Korean', code: 'ko' },
];
```

---

## 🔄 Complete Flow

### 1️⃣ User chọn Category trong UI

**ui.tsx:**
```tsx
<Select
  value={watch('categoryID')?.toString()}  // Display: "2"
  onValueChange={(value) => 
    setValue('categoryID', parseInt(value), { shouldValidate: true })
  }
>
  <SelectContent>
    {CATEGORIES.map((cat) => (
      <SelectItem key={cat.id} value={cat.id}>
        {cat.name}  {/* Display: "TOEIC" */}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Flow:**
- User nhìn thấy: `TOEIC`
- User click chọn
- Select value = `"2"` (string từ `cat.id`)
- `onValueChange` nhận `value = "2"`
- `parseInt("2")` → `2` (number)
- `setValue('categoryID', 2)` → Form state = `{ categoryID: 2 }`

---

### 2️⃣ User chọn Language trong UI

**ui.tsx:**
```tsx
<Select
  value={watch('language')}  // Display: "English"
  onValueChange={(value) => 
    setValue('language', value, { shouldValidate: true })
  }
>
  <SelectContent>
    {LANGUAGES.map((lang) => (
      <SelectItem key={lang.name} value={lang.name}>
        {lang.name}  {/* Display: "English" */}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Flow:**
- User nhìn thấy: `English`
- User click chọn
- Select value = `"English"` (string từ `lang.name`)
- `onValueChange` nhận `value = "English"`
- `setValue('language', "English")` → Form state = `{ language: "English" }`

---

## 📤 Submit to Backend

### Form State (CourseInfoFormValues)
```typescript
{
  title: "IELTS Writing Foundation BY Tutor huy nam",
  description: "Learn how to write IELTS Task 1 and Task 2 essays effectively.",
  categoryID: 2,              // ✅ Number
  language: "English",        // ✅ String
  duration: 30,
  price: 2500000,
  thumbnailURL: "https://example.com/ielts-writing.jpg"
}
```

### API Payload (POST /tutor/courses)
```json
{
  "title": "IELTS Writing Foundation BY Tutor huy nam",
  "description": "Learn how to write IELTS Task 1 and Task 2 essays effectively.",
  "duration": 30,
  "price": 2500000,
  "language": "English",
  "thumbnailURL": "https://example.com/ielts-writing.jpg",
  "categoryID": 2
}
```

---

## ✅ Type Safety

### types.ts
```typescript
export interface CourseFormData {
  categoryID: number;    // ✅ MUST BE NUMBER
  language: string;      // ✅ MUST BE STRING
}
```

### form.ts (Zod Schema)
```typescript
export const courseInfoSchema = z.object({
  categoryID: z.number({
    required_error: 'Vui lòng chọn danh mục',
    invalid_type_error: 'Danh mục phải là số',
  }).int().positive(),
  
  language: z.string()
    .nonempty('Vui lòng chọn ngôn ngữ'),
});
```

---

## 🚨 Common Mistakes

### ❌ Wrong: categoryID as string
```typescript
// ui.tsx - WRONG!
onValueChange={(value) => setValue('categoryID', value)} // "2" string

// Backend receives:
{ "categoryID": "2" } // ❌ String, backend expects number
```

### ✅ Correct: categoryID as number
```typescript
// ui.tsx - CORRECT!
onValueChange={(value) => setValue('categoryID', parseInt(value))} // 2 number

// Backend receives:
{ "categoryID": 2 } // ✅ Number
```

---

## 🔍 Debugging Tips

### Check form state in browser console:
```typescript
// In index.tsx
const courseInfoForm = useCourseInfoForm();

console.log(courseInfoForm.watch()); 
// Should show: { categoryID: 2, language: "English", ... }

console.log(typeof courseInfoForm.watch('categoryID')); 
// Should be: "number"

console.log(typeof courseInfoForm.watch('language')); 
// Should be: "string"
```

### Check API payload before sending:
```typescript
// In api.ts - createCourseApi()
console.log('Payload:', data);
console.log('categoryID type:', typeof data.categoryID); // "number"
console.log('language type:', typeof data.language);     // "string"
```

---

## 📝 Summary

| Field | Source | UI Display | Select Value | Form State | Backend |
|-------|--------|------------|--------------|------------|---------|
| **Category** | `CATEGORIES[1]` | "TOEIC" | `"2"` (string) | `2` (number) | `2` (number) |
| **Language** | `LANGUAGES[0]` | "English" | `"English"` (string) | `"English"` (string) | `"English"` (string) |

**Key Points:**
1. ✅ Category: **String → Number conversion** trong `onValueChange`
2. ✅ Language: **String → String** (no conversion needed)
3. ✅ Backend nhận đúng type: `categoryID: number`, `language: string`

---

Updated: 2025-01-09
