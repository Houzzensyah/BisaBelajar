import React, { useState, useCallback } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, Image, SafeAreaView } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { posts, auth } from "../../services/api";
import { getToken } from "../../services/auth";
import { ThemedText } from "@/components/themed-text";

const getImageUrl = (photoUrl: string | null): string | null => {
  if (!photoUrl) return null;
  if (photoUrl.startsWith("http")) return photoUrl;
  // Construct full URL based on platform
  const baseUrl = "http://127.0.0.1:8000";
  if (photoUrl.startsWith("storage/")) return `${baseUrl}/${photoUrl}`;
  return `${baseUrl}/${photoUrl}`;
};

export default function PostsScreen() {
  const [postsList, setPostsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  const loadPosts = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const [postsRes, userRes] = await Promise.all([posts.list(), auth.me()]);
      const allPosts = postsRes.data.data || postsRes.data || [];
      // Filter to show only current user's posts
      const userPosts = allPosts.filter((post: any) => post.user_id === userRes.data.id);
      setPostsList(userPosts);
      setCurrentUser(userRes.data);
    } catch (err) {
      console.warn("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleDeletePost = (postId: number) => {
    setPostsList((prev) => prev.filter((p) => p.id !== postId));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading posts...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">📝 My Posts</ThemedText>
        <TouchableOpacity onPress={() => router.push("/posts/create")} style={styles.createButton}>
          <ThemedText style={styles.createButtonText}>+ New</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        scrollEnabled={false}
        data={postsList}
        keyExtractor={(p) => String(p.id)}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No posts yet</ThemedText>
            <TouchableOpacity onPress={() => router.push("/posts/create")} style={styles.createPostButton}>
              <ThemedText style={styles.createPostButtonText}>Create your first post 📝</ThemedText>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.threadContainer}>
            {/* Main Thread Post */}
            <View style={styles.postContainer}>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <ThemedText style={styles.avatarText}>{item.user?.name?.charAt(0) || "U"}</ThemedText>
                  </View>
                  <View style={styles.userDetails}>
                    <ThemedText style={styles.userName}>{item.user?.name}</ThemedText>
                    <ThemedText style={styles.postDate}>{new Date(item.created_at).toLocaleDateString()}</ThemedText>
                  </View>
                </View>
                {currentUser?.id === item.user_id && (
                  <TouchableOpacity
                    onPress={() => {
                      posts.delete(item.id);
                      handleDeletePost(item.id);
                    }}
                  >
                    <ThemedText style={styles.deleteButton}>⋮</ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              {/* Post Title */}
              {item.title && <ThemedText style={styles.postTitle}>{item.title}</ThemedText>}

              {/* Post Photo */}
              {item.photo_url && getImageUrl(item.photo_url) && <Image source={{ uri: getImageUrl(item.photo_url)! }} style={styles.postPhoto} />}

              {/* Post Content */}
              <View style={styles.postContent}>
                <ThemedText style={styles.postText}>{item.content}</ThemedText>
              </View>

              {/* Related Course */}
              {item.course && (
                <View style={styles.courseTag}>
                  <ThemedText style={styles.courseTagText}>📚 Course: {item.course.title}</ThemedText>
                </View>
              )}

              {/* Post Actions */}
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionItem} onPress={() => router.push(`/users/${item.user?.id}`)}>
                  <ThemedText style={styles.actionText}>👤 View</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem} onPress={() => router.push(`/conversation?user_id=${item.user?.id}`)}>
                  <ThemedText style={styles.actionItemText}>💬 Message</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem} onPress={() => router.push(`/posts/reply?thread_id=${item.id}`)}>
                  <ThemedText style={styles.actionText}>🔗 Reply</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Thread Replies */}
            {item.replies && item.replies.length > 0 && (
              <View style={styles.repliesContainer}>
                <View style={styles.threadLine} />
                {item.replies.map((reply: any) => (
                  <View key={reply.id} style={styles.replyContainer}>
                    <View style={styles.replyHeader}>
                      <View style={styles.replyAvatar}>
                        <ThemedText style={styles.replyAvatarText}>{reply.user?.name?.charAt(0) || "U"}</ThemedText>
                      </View>
                      <View style={styles.replyUserDetails}>
                        <ThemedText style={styles.replyUserName}>{reply.user?.name}</ThemedText>
                        <ThemedText style={styles.replyDate}>{new Date(reply.created_at).toLocaleDateString()}</ThemedText>
                      </View>
                      {currentUser?.id === reply.user_id && (
                        <TouchableOpacity
                          onPress={() => {
                            posts.delete(reply.id);
                            loadPosts();
                          }}
                        >
                          <ThemedText style={styles.replyDeleteButton}>⋮</ThemedText>
                        </TouchableOpacity>
                      )}
                    </View>
                    {reply.photo_url && getImageUrl(reply.photo_url) && <Image source={{ uri: getImageUrl(reply.photo_url)! }} style={styles.replyPhoto} />}
                    <View style={styles.replyContent}>
                      <ThemedText style={styles.replyText}>{reply.content}</ThemedText>
                    </View>
                  </View>
                ))}
                {/* Add Reply Button in Thread */}
                <TouchableOpacity style={styles.addReplyButton} onPress={() => router.push(`/posts/reply?thread_id=${item.id}`)}>
                  <ThemedText style={styles.addReplyButtonText}>+ Add Reply</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* Reply Button if no replies yet */}
            {(!item.replies || item.replies.length === 0) && (
              <View style={styles.noRepliesHint}>
                <ThemedText style={styles.noRepliesText}>Be the first to reply</ThemedText>
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  createButton: {
    backgroundColor: "#0ea5a3",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  postContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0ea5a3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: "600",
    fontSize: 14,
    color: "#1f2937",
  },
  postDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  deleteButton: {
    fontSize: 20,
    color: "#999",
  },
  postTitle: {
    paddingHorizontal: 16,
    paddingTop: 12,
    fontWeight: "700",
    fontSize: 16,
    color: "#1f2937",
  },
  postPhoto: {
    width: "100%",
    height: 250,
    marginTop: 12,
    resizeMode: "cover",
  },
  postContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  courseTag: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#eef2ff",
    borderLeftWidth: 3,
    borderLeftColor: "#0ea5a3",
    borderRadius: 6,
  },
  courseTagText: {
    color: "#0ea5a3",
    fontWeight: "600",
    fontSize: 12,
  },
  postActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 8,
  },
  actionItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    alignItems: "center",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0ea5a3",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginBottom: 16,
  },
  createPostButton: {
    backgroundColor: "#0ea5a3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createPostButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  threadContainer: {
    marginHorizontal: 8,
    marginVertical: 8,
  },
  repliesContainer: {
    backgroundColor: "#f9fafb",
    paddingLeft: 16,
    paddingVertical: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  threadLine: {
    width: 2,
    height: 8,
    backgroundColor: "#0ea5a3",
    marginBottom: 8,
    marginLeft: 8,
  },
  replyContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    marginLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#0ea5a3",
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  replyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0f2f1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  replyAvatarText: {
    color: "#0ea5a3",
    fontWeight: "700",
    fontSize: 14,
  },
  replyUserDetails: {
    flex: 1,
  },
  replyUserName: {
    fontWeight: "600",
    fontSize: 13,
    color: "#1f2937",
  },
  replyDate: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  replyDeleteButton: {
    fontSize: 18,
    color: "#999",
  },
  replyPhoto: {
    width: "100%",
    height: 180,
    marginVertical: 8,
    borderRadius: 6,
    resizeMode: "cover",
  },
  replyContent: {
    marginVertical: 8,
  },
  replyText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 19,
  },
  noRepliesHint: {
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    marginHorizontal: 12,
    marginBottom: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  noRepliesText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  addReplyButton: {
    marginHorizontal: 8,
    marginVertical: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#eef2ff",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0ea5a3",
  },
  addReplyButtonText: {
    color: "#0ea5a3",
    fontWeight: "600",
    fontSize: 13,
  },
});
