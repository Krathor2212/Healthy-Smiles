import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from '@react-navigation/stack';
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import {
    Animated,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import AppHeader from "../components/AppHeader";
import { RootStackParamList } from "../navigation/types";

const STORAGE_KEY = "MEDICAL_FILES";

type MedicalFile = {
  id: string;
  name: string;
  uri: string;
  size: number;
  mimeType: string | null;
  createdAt: string;
};

export default function MedicalFileManagerScreen() {
  const [files, setFiles] = useState<MedicalFile[]>([]);
  const [savedFiles, setSavedFiles] = useState<MedicalFile[]>([]); // snapshot from storage
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingFile, setEditingFile] = useState<MedicalFile | null>(null);
  const [labelInput, setLabelInput] = useState("");
  const [pickedPreview, setPickedPreview] = useState<MedicalFile | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isDirty, setDirty] = useState(false); // track unsaved changes
  const fadeAnim = new Animated.Value(0);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const handleBackPress = () => navigation.goBack();

  const persist = async (
    updater: MedicalFile[] | ((prev: MedicalFile[]) => MedicalFile[])
  ) => {
    setFiles((prev) => {
      const next =
        typeof updater === "function" ? (updater as any)(prev) : updater;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(console.warn);
      return next;
    });
  };

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        setFiles(parsed);
        setSavedFiles(parsed);
      } catch (e) {
        console.warn("Failed to load files", e);
      }
    };
    loadFiles();
  }, []);

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      }, 1500);
    });
  };

  const handleAddFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.length) return;
    const doc = result.assets[0];
    const file: MedicalFile = {
      id: Date.now().toString(),
      name: doc.name,
      uri: doc.uri,
      size: doc.size || 0,
      mimeType: doc.mimeType || null,
      createdAt: new Date().toISOString(),
    };
    setPickedPreview(file);
  };

  const handleSavePreview = () => {
    if (!pickedPreview) return;
    // Add to local list, mark dirty — don't persist until user presses Save
    setFiles((prev) => [pickedPreview!, ...prev]);
    setPickedPreview(null);
    setDirty(true);
    showToast("File added to list (unsaved)");
  };

  const handleEditPreview = () => {
    if (!pickedPreview) return;
    setEditingFile(pickedPreview);
    setLabelInput(pickedPreview.name);
    setModalVisible(true);
  };
  
  const handleRename = (file: MedicalFile) => {
    setEditingFile(file);
    setLabelInput(file.name);
    setModalVisible(true);
  };

  const confirmRename = () => {
    if (!editingFile) return;

    // If we're renaming the picked preview (it may already be in files list), update it locally
    if (pickedPreview && editingFile.id === pickedPreview.id) {
      setPickedPreview({ ...pickedPreview, name: labelInput });
      // also update in the local list if present
      setFiles((prev) => prev.map((f) => (f.id === editingFile.id ? { ...f, name: labelInput } : f)));
    } else {
      // Update local list only and mark dirty
      setFiles((prev) =>
        prev.map((f) => (f.id === editingFile.id ? { ...f, name: labelInput } : f))
      );
    }

    setDirty(true);
    setModalVisible(false);
    showToast("Name changed (unsaved)");
  };
  
  const handleDelete = (file: MedicalFile) => {
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    // also clear preview if deleting pickedPreview
    if (pickedPreview && pickedPreview.id === file.id) setPickedPreview(null);
    setDirty(true);
    showToast("File removed (unsaved)");
  };

  // Save all local changes to AsyncStorage
  const handleSaveAll = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(files));
      setSavedFiles(files);
      setDirty(false);
      showToast("Changes saved");
    } catch (e) {
      console.warn("Failed to save files", e);
      showToast("Save failed");
    }
  };

  const renderFile = ({ item }: { item: MedicalFile }) => (
    <View style={styles.fileRow}>
      <View style={[styles.fileInfo, { flex: 1 }]}>
        <Ionicons name="document-text-outline" size={22} color="#007AFF" />
        <View style={{ marginLeft: 8, flex: 1 }}>
          <Text style={styles.fileName} numberOfLines={2} ellipsizeMode="tail">
            {item.name}
          </Text>
        <Text style={styles.fileMeta}>
            {typeof item.size === "number" ? `${(item.size / 1048576).toFixed(2)} MB` : "—"}
        </Text>
        </View>
      </View>
      <View style={styles.fileActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRename(item)}
        >
          <Ionicons name="create-outline" size={18} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#d00" />
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <AppHeader title="Medical Records" onBack={handleBackPress} />

      {pickedPreview && (
        <View style={styles.previewBanner}>
          <Text style={styles.previewText}>Selected: {pickedPreview.name}</Text>
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={[styles.previewBtn, { backgroundColor: "#007AFF" }]}
              onPress={handleSavePreview}
            >
              <Text style={[styles.previewBtnText, { color: "#fff" }]}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.previewBtn, { marginLeft: 8, backgroundColor: "#f5f5f5" }]}
              onPress={handleEditPreview}
            >
              <Ionicons name="create-outline" size={16} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.previewBtn, { marginLeft: 8 }]}
              onPress={() => setPickedPreview(null)}
            >
              <Text style={styles.previewBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Add & Save buttons centered with extra top padding */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddFile}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add File</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, !isDirty && styles.saveButtonDisabled]}
          onPress={handleSaveAll}
          disabled={!isDirty}
        >
          <Text style={[styles.saveButtonText, !isDirty && { opacity: 0.6 }]}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>

      {files.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="folder-open-outline" size={40} color="#aaa" />
          <Text style={styles.emptyText}>No files yet</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          renderItem={renderFile}
          contentContainerStyle={{ gap: 10, marginTop: 12 }}
        />
      )}

      {/* Rename Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10 }]}>
            <Text style={styles.modalTitle}>Rename File</Text>
            <TextInput
              value={labelInput}
              onChangeText={setLabelInput}
              style={styles.input}
              placeholder="Enter file name"
              placeholderTextColor="#aaa"
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 14 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#eee", marginRight: 10 }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "#333", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#007AFF" }]}
                onPress={confirmRename}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Toast */}
      {successMessage ? (
        <Animated.View
          style={{
            opacity: fadeAnim,
            position: "absolute",
            bottom: 40,
            alignSelf: "center",
            backgroundColor: "#007AFF",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>{successMessage}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // use a light grey background like the rest of the app and keep padding
  container: { flex: 1, backgroundColor: "#fff" },

  previewBanner: {
    backgroundColor: "#fff7ed",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ffe1b5",
  },
  previewText: { fontSize: 14, color: "#333", marginBottom: 8 },
  previewActions: { flexDirection: "row", alignItems: "center" },
  previewBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  previewBtnText: { color: "#333", fontWeight: "600" },

  // tightened spacing so buttons sit closer under the header
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 8,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
    alignSelf: "center",
  },
  addButtonText: { color: "#fff", marginLeft: 8, fontWeight: "600" },

  saveButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#28a745",
    alignSelf: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#b9e6c8",
  },
  saveButtonText: { color: "#fff", fontWeight: "700" },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 24 },
  emptyText: { color: "#666" },
  fileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  fileInfo: { flexDirection: "row", alignItems: "center" },
  fileName: { fontSize: 14, fontWeight: "600" },
  fileMeta: { fontSize: 12, color: "#666" },
  fileActions: { flexDirection: "row", alignItems: "center" },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginLeft: 6,
  },
  actionText: { color: "#333" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#333",
  },
  modalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
