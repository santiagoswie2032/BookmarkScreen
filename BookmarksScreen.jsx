import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { bookmarksManager } from '../lib/resourceManager';
import { useAuth } from '../hooks/useAuth';

export default function BookmarksScreen({ navigation }) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await bookmarksManager.list();
      setBookmarks(data.bookmarks);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleUnbookmark = (lessonId) => {
    // Optimistically update the UI so it feels instant
    setBookmarks(bookmarks.filter((b) => b.lessonId !== lessonId));
    bookmarksManager.remove(lessonId);
  };

  const handleOpenLesson = (lessonId) => {
    setIsLoading(true); // reuse loading flag to block double taps
    navigation.navigate('LessonDetail', { lessonId });
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Bookmarks</Text>
      {bookmarks.length === 0 ? (
        <Text style={styles.empty}>No bookmarks yet.</Text>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item, index) => String(index)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => handleOpenLesson(item.lessonId)}
            >
              <Image source={{ uri: item.thumbnailUrl }} style={styles.thumb} />
              <View style={styles.rowText}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.category}>{item.category}</Text>
              </View>
              <TouchableOpacity onPress={() => handleUnbookmark(item.lessonId)}>
                <Text style={styles.remove}>Remove</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  empty: { color: '#666', marginTop: 24, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  thumb: { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  rowText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  category: { color: '#888', marginTop: 2 },
  remove: { color: '#d33', fontWeight: '600' },
});
