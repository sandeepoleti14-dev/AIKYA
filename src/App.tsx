import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import HomePage from '@/pages/Home/HomePage';
import EventsPage from '@/pages/Events/EventsPage';
import ListingDetailPage from '@/pages/Listing/ListingDetailPage';
import LearnPage from '@/pages/Learn/LearnPage';
import RoadmapDetailPage from '@/pages/Learn/RoadmapDetailPage';
import ExplorePage from '@/pages/Explore/ExplorePage';
import JobsPage from '@/pages/Jobs/JobsPage';
import CommunityLayout from '@/pages/Community/CommunityLayout';
import CommunityFeedPage from '@/pages/Community/CommunityFeedPage';
import CommunityAuthPage from '@/pages/Community/CommunityAuthPage';
import {
  CommunityProfilePage,
  MemberProfilePage,
  MySubmissionsPage,
  ShareOpportunityPage,
} from '@/pages/Community/CommunityAccountPages';
import CommunityModerationPage from '@/pages/Community/CommunityModerationPage';
import CommunityReviewPage, { CommunityReviewsPage } from '@/pages/Community/CommunityReviewPage';
import AboutPage from '@/pages/About/AboutPage';
import ContactPage from '@/pages/Contact/ContactPage';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import DashboardLayout from '@/pages/Dashboard/DashboardLayout';
import OverviewPage from '@/pages/Dashboard/OverviewPage';
import ProgressPage from '@/pages/Dashboard/ProgressPage';
import ProfilePage from '@/pages/Dashboard/ProfilePage';
import SettingsPage from '@/pages/Dashboard/SettingsPage';
import {
  DashboardEventsView,
  DashboardExploreView,
  DashboardRoadmapsView,
  DashboardSavedView,
} from '@/pages/Dashboard/DashboardViews';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:id" element={<ListingDetailPage />} />
        <Route path="programs" element={<Navigate to="/learn" replace />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="learn/:id" element={<RoadmapDetailPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="community" element={<CommunityLayout />}>
          <Route index element={<CommunityFeedPage />} />
          <Route path="events" element={<CommunityFeedPage category="events" />} />
          <Route path="workshops" element={<CommunityFeedPage category="workshops" />} />
          <Route path="hackathons" element={<CommunityFeedPage category="hackathons" />} />
          <Route path="courses" element={<CommunityFeedPage category="courses" />} />
          <Route path="login" element={<CommunityAuthPage mode="login" />} />
          <Route path="register" element={<CommunityAuthPage mode="register" />} />
          <Route path="share" element={<ShareOpportunityPage />} />
          <Route path="my-submissions" element={<MySubmissionsPage />} />
          <Route path="profile" element={<CommunityProfilePage />} />
          <Route path="members/:id" element={<MemberProfilePage />} />
          <Route path="reviews" element={<CommunityReviewsPage />} />
          <Route path="reviews/write" element={<CommunityReviewPage />} />
          <Route path="admin" element={<CommunityModerationPage />} />
        </Route>
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="dashboard" element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="explore" element={<DashboardExploreView />} />
        <Route path="events" element={<DashboardEventsView />} />
        <Route path="roadmaps" element={<DashboardRoadmapsView />} />
        <Route path="saved" element={<DashboardSavedView />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
