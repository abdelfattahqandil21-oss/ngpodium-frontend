export interface IPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  coverImage: string | null;
  tags: string[];
  authorId: number;
  author: {
    id: number;
    username: string;
    nickname: string | null;
    image: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

// Response for offset-based pagination (feed endpoint)
export interface IPostFeedResponse {
  items: IPost[];
  meta: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

// Response for page-based pagination (main posts endpoint)
export interface IPostListResponse {
  items: IPost[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Query parameters for searching/filtering posts
export interface IPostsQueryParams {
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'title';
  order?: 'asc' | 'desc';
  q?: string; // Search query
  tags?: string; // Comma-separated tags
  authorId?: number;
}

// Query parameters for feed (offset-based)
export interface IPostsFeedQueryParams {
  offset?: number;
  limit?: number;
}

// State interface for posts
export interface IPostsState {
  posts: IPost[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  hasMore: boolean;
}

// Backward compatibility
export interface IPostResponse extends IPostFeedResponse {}
