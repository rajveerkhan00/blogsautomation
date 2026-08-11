import mongoose, { Document, Schema } from "mongoose";

export interface IPageVisit {
  path: string;
  visitedAt: Date;
  durationSeconds: number;
}

export interface IAnalytics extends Document {
  visitorId: string;
  sessionStartedAt: Date;
  lastActiveAt: Date;
  visits: IPageVisit[];
  userAgent: string;
}

const PageVisitSchema = new Schema<IPageVisit>({
  path: { type: String, required: true },
  visitedAt: { type: Date, default: Date.now },
  durationSeconds: { type: Number, default: 0 },
});

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    visitorId: { type: String, required: true, index: true },
    sessionStartedAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    visits: [PageVisitSchema],
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-delete records older than 90 days
AnalyticsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Analytics = mongoose.models.Analytics || mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

export default Analytics;
