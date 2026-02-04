import NotFoundPage from '../pages/404.jsx';
import LoginPage from '../pages/login/login.jsx';
import AttendancePage from '../pages/attendance/attendance.jsx';
import ReimbursePage from '../pages/reimburse/reimburse.jsx';
import ProfilePage from '../pages/profile/profile.jsx';
import Layout from '../layout/layout.jsx';
import ReimburseSubmission from '../pages/reimburse/components/reimburseSubmission.jsx';
import AccountSettingsPage from '../pages/account-settings/accountSettings.jsx';
import NotificationProfilePage from '../pages/notifications-profile/notificationProfile.jsx';
import EmailSettings from '../pages/account-settings/components/emailSettings.jsx';
import Verifications from '../pages/account-settings/components/verifications.jsx';
import UpdatePassword from '../pages/account-settings/components/updatePassword.jsx';
import LanguagePage from '../pages/language/language.jsx';
import DisplayPage from '../pages/display/display.jsx';
import SchedulePage from '../pages/schedule/schedule.jsx';
import FaceRecognizer from '../pages/home/components/faceRecognizer.jsx';
import PermissionPage from '../pages/permission/permission.jsx';
import PermissionSubmission from '../pages/permission/components/permissionSubmission.jsx';
import TrainingPage from '../pages/training/training.jsx';
import TrainingDetail from '../pages/training/components/trainingDetail.jsx';
import QuestionPage from '../pages/training/components/question.jsx';
import VideoLearning from '../pages/training/components/videoLearning.jsx';
import ResultTraining from '../pages/training/components/resultTraining.jsx';
import PayrollPage from '../pages/payroll/payroll.jsx';
import ScanQRPage from '../pages/training/components/scanQr.jsx';
import ProcurementPage from '../pages/procurement/procurement.jsx';
import ProcurementSubmission from '../pages/procurement/components/procurementSubmission.jsx';
import VisitPage from '../pages/visit/visit.jsx';
import VisitSubmission from '../pages/visit/components/visitSubmission.jsx';
import PerformancePage from '../pages/performance/performance.jsx';
import PerformanceDetailPage from '../pages/performance/components/performanceDetail.jsx';
import VisitDetails from '../pages/visit/components/visitDetails.jsx';
import ReimburseDetail from '../pages/reimburse/components/reimburseDetail.jsx';
import ProcurementDetail from '../pages/procurement/components/procurementDetail.jsx';
import PermissionDetail from '../pages/permission/components/permissionDetail.jsx';
import NotificationsPage from '../pages/notifications/notifications.jsx';
import NotificationsDetail from '../pages/notifications/components/notificationsDetail.jsx';
import DataUser from '../pages/profile/pages/dataUser/dataUser.jsx';
import DataEducation from '../pages/profile/pages/dataEducation.jsx/dataEducation.jsx';
import DataPayroll from '../pages/profile/pages/dataPayroll/dataPayroll.jsx';
import DataPersonal from '../pages/profile/pages/dataPersonal/dataPersonal.jsx';
import DataPekerjaan from '../pages/profile/pages/dataPekerjaan/dataPekerjaan.jsx';
import NewsDetail from '../pages/notifications/components/newsDetail.jsx';
import CaptureFace from '../pages/login/components/captureFace.jsx';
import MapComponent from '../components/map.jsx';
import OvertimePage from '../pages/overtime/overtime.jsx';
import OvertimeDetails from '../pages/overtime/components/overtimeDetail.jsx';
import OvertimeSubmission from '../pages/overtime/components/overtimeSubmission.jsx';
import LoadingPage from '../pages/loading/loading.jsx';
import SubmitOutsideOffice from '../pages/home/components/submitOutsideOffice.jsx';
import ApprovalPage from '../pages/home/components/ApprovalPage.jsx';
import Splashscreen from '../pages/splashsreen/splashscreen.jsx';
import ConnectionLost from '../pages/connection-lost/connectionLost.jsx';
import ScheduleDetail from '../pages/schedule/pages/scheduleDetail/scheduleDetail.jsx';
import CardScheduleDetail from '../pages/schedule/pages/cardScheduleDetail/cardScheduleDetail.jsx';
import AddSchedule from '../pages/schedule/pages/addSchedule/addSchedule.jsx';
import UpdateSchedule from '../pages/schedule/pages/updateSchedule/updateSchedule.jsx';
import RegisterFace from '../pages/login/pages/register/registerFace.jsx';
import JobdescPage from '../pages/login/pages/jobdesc/jobdesc.jsx';
import JobdescDetailPage from '../pages/login/pages/jobdesc/jobdescDetail.jsx';
import UploadDokumenPage from '../pages/login/pages/upload-dokumen/uploadDokumen.jsx';
import UploadDokumenForm from '../pages/login/pages/upload-dokumen/uploadDokumenForm.jsx';
import JobdescNodePage from '../pages/profile/pages/dataPekerjaan/components/jobdescNodePage.jsx';
import LeaveBalanceHistory from '../pages/permission/components/leaveBalanceHistory.jsx';
import CaptureKTP from '../pages/login/pages/upload-dokumen/captureKTP.jsx';
import ValidasiKtp from '../pages/login/pages/upload-dokumen/validasiKtp.jsx';
import UploadDokumenList from '../pages/login/pages/upload-dokumen/uploadDokumenList.jsx';
import EmployeDataPage from '../pages/login/pages/employe-data/employeDataPage.jsx';
import EmployeDataList from '../pages/login/pages/employe-data/employeDataList.jsx';
import EmployeDataForm from '../pages/login/pages/employe-data/employeDataForm.jsx';

var routes = [
  {
    path: '/',
    component: Splashscreen,
  },
  {
    path: '/login/',
    component: LoginPage,
  },
  {
    path: '/register-face/',
    component: RegisterFace,
  },
  {
    path: '/jobdesc/',
    component: JobdescPage,
  },
  {
    path: '/jobdesc-detail/',
    component: JobdescDetailPage,
  },
  {
    path: '/upload-dokumen/',
    component: UploadDokumenPage,
  },
  {
    path: '/upload-dokumen-list/',
    component: UploadDokumenList,
  },
  {
    path: '/capture-ktp/',
    component: CaptureKTP,
  },
  {
    path: '/validation-ktp/',
    component: ValidasiKtp,
  },
  {
    path: '/upload-dokumen-submit/',
    component: UploadDokumenForm,
  },
  {
    path: '/home/',
    component: Layout,
  },
  {
    path: '/capture-face/:type/',
    component: CaptureFace,
  },
  {
    path: '/face-recognize/',
    component: FaceRecognizer,
  },
  {
    path: '/submit-outside-office/',
    component: SubmitOutsideOffice,
  },
  {
    path: '/profile/',
    component: ProfilePage,
  },
  {
    path: '/user-data/',
    component: DataUser,
  },
  {
    path: '/education-data/',
    component: DataEducation,
  },
  {
    path: '/payroll-data/',
    component: DataPayroll,
  },
  {
    path: '/personal-data/',
    component: DataPersonal,
  },
  {
    path: '/employment-data/',
    component: DataPekerjaan,
  },
  {
    path: '/jobdesc-node/',
    component: JobdescNodePage,
  },
  {
    path: '/employe-data/',
    component: EmployeDataPage,
  },
  {
    path: '/employe-data-list/',
    component: EmployeDataList,
  },
  {
    path: '/employe-data-form/',
    component: EmployeDataForm,
  },
  {
    path: '/account-settings/',
    component: AccountSettingsPage,
  },
  {
    path: '/email-settings/',
    component: EmailSettings,
  },
  {
    path: '/update-password/',
    component: UpdatePassword,
  },
  {
    path: '/notification-profile/',
    component: NotificationProfilePage,
  },
  {
    path: '/language/',
    component: LanguagePage,
  },
  {
    path: '/display/',
    component: DisplayPage,
  },
  {
    path: '/notifications/',
    component: NotificationsPage,
  },
  {
    path: '/notifications-detail/:id/:type/:backto',
    component: NotificationsDetail,
  },
  {
    path: '/news/:id/:backto',
    component: NewsDetail,
  },
  {
    path: '/schedule/',
    component: SchedulePage,
  },
  {
    path: '/add-schedule/',
    component: AddSchedule,
  },
  {
    path: '/update-schedule/',
    component: UpdateSchedule,
  },
  {
    path: '/schedule-detail/:date/',
    component: ScheduleDetail,
  },
  {
    path: '/card-schedule-detail/',
    component: CardScheduleDetail,
  },
  {
    path: '/approval/',
    component: ApprovalPage,
  },
  {
    path: '/verifications/',
    component: Verifications,
  },
  {
    path: '/attendance/',
    component: AttendancePage,
  },
  {
    path: '/performance/',
    component: PerformancePage,
  },
  {
    path: '/performance-detail/:month/:year/',
    component: PerformanceDetailPage,
  },
  {
    path: '/payroll/',
    component: PayrollPage,
  },
  {
    path: '/training/',
    component: TrainingPage,
  },
  {
    path: '/training-detail/:id/',
    component: TrainingDetail,
  },
  {
    path: '/visit/',
    component: VisitPage,
  },
  {
    path: '/visit-submission/',
    component: VisitSubmission,
  },
  {
    path: '/visit-map/',
    component: MapComponent,
  },
  {
    path: '/visit-detail/:id/',
    component: VisitDetails,
  },
  {
    path: '/training-detail/:id/:test/',
    component: TrainingDetail,
  },
  {
    path: '/scan/:id/',
    component: ScanQRPage,
  },
  {
    path: '/question/:id/',
    component: QuestionPage,
  },
  {
    path: '/video-learning/:id/',
    component: VideoLearning,
  },
  {
    path: '/result/:id/',
    component: ResultTraining,
  },
  {
    path: '/permission/',
    component: PermissionPage,
  },
  {
    path: '/leave-history/',
    component: LeaveBalanceHistory,
  },
  {
    path: '/permission-submission/',
    component: PermissionSubmission,
  },
  {
    path: '/permission-detail/:id/',
    component: PermissionDetail,
  },
  {
    path: '/procurement/',
    component: ProcurementPage,
  },
  {
    path: '/procurement-submission/',
    component: ProcurementSubmission,
  },
  {
    path: '/procurement-detail/:id/',
    component: ProcurementDetail,
  },
  {
    path: '/reimburse/',
    component: ReimbursePage,
  },
  {
    path: '/overtime/',
    component: OvertimePage,
  },
  {
    path: '/overtime-submission/',
    component: OvertimeSubmission,
  },
  {
    path: '/overtime-detail/:id/',
    component: OvertimeDetails,
  },
  {
    path: '/reimburse-submission/',
    component: ReimburseSubmission,
  },
  {
    path: '/loading/',
    component: LoadingPage,
  },
  {
    path: '/reimburse-detail/:id/',
    component: ReimburseDetail,
  },
  {
    path: '/connection-lost/',
    component: ConnectionLost,
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;