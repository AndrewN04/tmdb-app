"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Id } from "../../convex/_generated/dataModel";

interface ReviewsSectionProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
}

export function ReviewsSection({ tmdbId, mediaType }: ReviewsSectionProps) {
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;
  
  const reviews = useQuery(api.actions.getReviews, { tmdbId, mediaType });
  const postReview = useMutation(api.actions.postReview);
  const deleteReview = useMutation(api.actions.deleteReview);
  
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await postReview({
        tmdbId,
        mediaType,
        rating,
        content,
      });
      setContent("");
      setRating(5);
      toast.success("Review posted!");
    } catch {
      toast.error("Failed to post review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"reviews">) => {
      if(!confirm("Delete this review?")) return;
      try {
          await deleteReview({ reviewId: id });
          toast.success("Review deleted");
      } catch {
          toast.error("Could not delete review");
      }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <h3 className="text-2xl font-bold">Reviews</h3>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-muted/30 p-6 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star 
                    className={`w-5 h-5 ${star <= rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} 
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">{rating}/10</span>
            </div>
          </div>
          
          <Textarea 
            placeholder="Write your thoughts..." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            className="min-h-[100px]"
          />
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Review"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-lg bg-muted/30 text-center">
          <p className="text-muted-foreground mb-4">Sign in to leave a review</p>
          <Button variant="outline" asChild>
              <a href="/sign-in">Sign In</a>
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {reviews === undefined ? (
          <div className="text-center py-8">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No reviews yet. Be the first!</div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="flex gap-4 border-b pb-6 last:border-0">
              <Avatar>
                <AvatarImage src={review.userImage} />
                <AvatarFallback>{review.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{review.userName}</span>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(review.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  {session?.user && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(review._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-1 mb-2">
                   <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                   <span className="text-sm font-medium">{review.rating}/10</span>
                </div>
                
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{review.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
