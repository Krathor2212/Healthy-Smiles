# File Sharing System Setup

## Overview
The file sharing system for chat is fully implemented in code but requires database migrations to be run before activation.

## Current Status
- ❌ **DISABLED** - File upload temporarily disabled pending database migrations
- ✅ Backend code fully implemented (uploadChatFile controller, 145 lines)
- ✅ Mobile app UI fully implemented (file picker, file display, icons)
- ✅ Migration files created and ready to run
- ✅ Temporary fixes applied to prevent 500 errors

## Database Migrations Required

### Step 1: Run Chat Files Migration
```sql
-- File: migration_add_chat_files.sql
-- Adds chat support to medical_files table

-- Execute in PostgreSQL:
psql -U postgres -d healthy_smiles -f migration_add_chat_files.sql
```

### Step 2: Run Message Files Migration
```sql
-- File: migration_add_message_files.sql
-- Adds file attachment support to messages

-- Execute in PostgreSQL:
psql -U postgres -d healthy_smiles -f migration_add_message_files.sql
```

### Step 3: Verify Migrations
```sql
-- Check that new columns exist:
\d messages
-- Should show: file_id UUID

\d medical_files
-- Should show: chat_id UUID, file_url TEXT

-- Check indexes:
\di idx_messages_file_id
\di idx_medical_files_chat_id
```

## Code Changes to Re-enable File Sharing

### Backend Changes

#### 1. Restore getChatMessages Query (chatController.js)
**File:** `Backend/src/controllers/chatController.js`  
**Lines:** 77-107

**Current (Simplified):**
```javascript
const query = `
  SELECT 
    m.id,
    m.sender_type,
    m.sender_id,
    m.text_enc,
    m.created_at
  FROM messages m
  WHERE m.chat_id = $1
  ORDER BY m.created_at ASC
`;
// ... returns file: null
```

**Restore to:**
```javascript
const query = `
  SELECT 
    m.id,
    m.sender_type,
    m.sender_id,
    m.text_enc,
    m.created_at,
    m.file_id,
    mf.filename_enc,
    mf.mime_type,
    mf.file_size
  FROM messages m
  LEFT JOIN medical_files mf ON m.file_id = mf.id
  WHERE m.chat_id = $1
  ORDER BY m.created_at ASC
`;

// And restore file object construction:
let fileData = null;
if (msg.file_id) {
  const decryptedFilename = decryptText(msg.filename_enc);
  fileData = {
    id: msg.file_id,
    name: decryptedFilename,
    mimeType: msg.mime_type,
    size: msg.file_size,
    url: `/api/files/${msg.file_id}`
  };
}

messages.push({
  id: msg.id,
  text: decryptedText,
  sender: msg.sender_type,
  time: formattedTime,
  createdAt: msg.created_at,
  file: fileData
});
```

#### 2. Uncomment Upload Route (chats.js)
**File:** `Backend/src/routes/chats.js`  
**Line:** 27-28

**Current:**
```javascript
// TODO: Uncomment after running migrations (migration_add_chat_files.sql, migration_add_message_files.sql)
// router.post('/:chatId/upload', authenticateToken, upload.single('file'), uploadChatFile);
```

**Change to:**
```javascript
router.post('/:chatId/upload', authenticateToken, upload.single('file'), uploadChatFile);
```

#### 3. Remove TODO Comments
- Remove TODO comment at line 77 in chatController.js
- Remove TODO comment at line 107 in chatController.js
- Remove TODO comment at line 27 in chats.js

### Mobile App Changes

#### 1. Uncomment Attach Button (IndividualChatScreen.tsx)
**File:** `Medics/app/Pages/Chat/IndividualChatScreen.tsx`  
**Lines:** 365-368

**Current:**
```tsx
{/* TODO: Uncomment after running database migrations */}
{/* <TouchableOpacity style={styles.inputActionButton} onPress={handleAttachFile} disabled={sending}>
  <Ionicons name="attach-outline" size={24} color={sending ? TEXT_SECONDARY : MAIN_GREEN} />
</TouchableOpacity> */}
```

**Change to:**
```tsx
<TouchableOpacity style={styles.inputActionButton} onPress={handleAttachFile} disabled={sending}>
  <Ionicons name="attach-outline" size={24} color={sending ? TEXT_SECONDARY : MAIN_GREEN} />
</TouchableOpacity>
```

#### 2. Restore Input Styling
**File:** `Medics/app/Pages/Chat/IndividualChatScreen.tsx`  
**Line:** ~572

**Current:**
```tsx
messageInput: {
  flex: 1,
  marginRight: 8, // Space before send button
  // ...
}
```

**Change to:**
```tsx
messageInput: {
  flex: 1,
  marginHorizontal: 8, // Space on both sides
  // ...
}
```

### Step 4: Restart Backend
```bash
cd Backend
npm start
```

## Testing File Upload

### Mobile App Test
1. Open chat with a doctor
2. Click attach button (paperclip icon)
3. Select a file (< 10MB)
4. Optionally add a message
5. Send
6. Verify:
   - File appears in chat bubble with icon
   - File name and size displayed
   - Message sent notification

### Verify Backend
1. Check database:
```sql
-- Check file record
SELECT id, patient_id, chat_id, mime_type, file_size 
FROM medical_files 
WHERE chat_id IS NOT NULL
ORDER BY upload_date DESC LIMIT 1;

-- Check message record
SELECT id, chat_id, file_id, text_enc, created_at
FROM messages
WHERE file_id IS NOT NULL
ORDER BY created_at DESC LIMIT 1;
```

2. Check file appears in patient's medical files section
3. Check doctor receives notification

## File Upload Features

### Backend (uploadChatFile)
- **Encryption:** ElGamal encryption for file content
- **Chunked Support:** Files > 200 bytes use chunked encryption
- **File Size Limit:** 10MB (configurable in multer)
- **Supported:** All file types (*)
- **Metadata Encryption:** AES-256-GCM for filename/description
- **Dual Visibility:** File appears in chat AND medical files section
- **Notifications:** Doctor notified when file uploaded
- **Database:** Creates medical_files record with chat_id, creates message with file_id

### Mobile App UI
- **File Picker:** expo-document-picker (all file types)
- **File Icons:** Automatic based on mime type (image, video, document, generic)
- **File Display:** Name, size, icon in semi-transparent card
- **Combined Messages:** Supports text + file, file only, or text only
- **Size Formatting:** Automatic B/KB/MB conversion
- **Validation:** 10MB client-side check before upload

## File Upload Flow

1. **Patient clicks attach** → DocumentPicker opens
2. **File selected** → Size validation (< 10MB)
3. **FormData created** → File + optional text message
4. **POST to /api/chats/:chatId/upload**
5. **Backend validates** → Chat access, patient owns chat
6. **Get ElGamal keys** → Patient's public key from profiles
7. **Encrypt file** → ElGamal (chunked if > 200 bytes)
8. **Encrypt metadata** → AES-256-GCM for filename/description
9. **Store in medical_files** → With chat_id reference
10. **Create message** → With file_id reference, nullable text_enc
11. **Update chat** → Set last_message, last_message_time
12. **Send notification** → Notify doctor of new file
13. **Return success** → Mobile app displays file in chat

## Next Steps (Post-Migration)

### Immediate
1. Run both migration SQL files
2. Restore backend code (getChatMessages, upload route)
3. Restore mobile app UI (attach button)
4. Restart backend server
5. Test file upload end-to-end

### Future Enhancements
- [ ] Doctor-side file upload (web portal)
- [ ] File download functionality
- [ ] Image preview for image files
- [ ] File type restrictions/warnings
- [ ] Progress bar for large uploads
- [ ] WebSocket for real-time file notifications
- [ ] File deletion capability
- [ ] File sharing permissions
- [ ] Multiple file upload
- [ ] Drag & drop (web portal)

## Troubleshooting

### Issue: Still getting 500 error
**Solution:** Verify migrations ran successfully, check column existence

### Issue: File not appearing in chat
**Solution:** Check getChatMessages query restored correctly, verify file_id in message

### Issue: Upload fails with "File too large"
**Solution:** Check file < 10MB, adjust multer limit if needed

### Issue: File icon not showing
**Solution:** Verify mimeType returned from backend, check getFileIcon function

### Issue: Doctor not notified
**Solution:** Check notification creation in uploadChatFile, verify doctor_id lookup

## Migration Rollback (If Needed)

```sql
-- Rollback message files migration
DROP INDEX IF EXISTS idx_messages_file_id;
ALTER TABLE messages DROP COLUMN IF EXISTS file_id;
ALTER TABLE messages ALTER COLUMN text_enc SET NOT NULL;

-- Rollback chat files migration
DROP INDEX IF EXISTS idx_medical_files_chat_id;
ALTER TABLE medical_files DROP COLUMN IF EXISTS file_url;
ALTER TABLE medical_files DROP COLUMN IF EXISTS chat_id;
```

## Contact
For issues or questions about file sharing implementation, check:
- Backend controller: `Backend/src/controllers/chatController.js` (lines 315-459)
- Mobile app UI: `Medics/app/Pages/Chat/IndividualChatScreen.tsx` (lines 194-238, 69-117)
- Database schema: `Backend/db/schema.sql`
