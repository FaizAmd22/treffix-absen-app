import React, { useEffect, useState } from "react";
import { Page, Link, Toolbar, Tabs, Tab, Button, f7 } from "framework7-react";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../slices/settingsSlice";
import { API } from "../../../api/axios";
import { formatDate } from "../../../functions/formatDate";
import { selectLanguages } from "../../../slices/languagesSlice";
import { translate } from "../../../utils/translate";
import { showToastFailed } from "../../../functions/toast";
import ButtonFixBottom from "../../../components/buttonFixBottom";
import CustomButton from "../../../components/customButton";
import Loading from "../../../components/loading";

const ResultTraining = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useSelector(selectSettings);
  const language = useSelector(selectLanguages);
  const token = localStorage.getItem("token");

  const handleTabChange = (tabId) => setActiveTab(tabId);

  useEffect(() => {
    const id = f7.views.main.router.currentRoute.params?.id;
    if (!id || !token) return;

    const fetchResults = async () => {
      try {
        setIsLoading(true);

        const response = await API.get(`/user-developments/${id}/test-results`);
        const payload = response.data.payload || [];
        console.log("payload:", payload);

        setTimeout(() => {
          if (!Array.isArray(payload) || payload.length === 0) {
            f7.views.main.router.navigate(`/training-detail/${id}/`, { clearPreviousHistory: true });
            return;
          }

          setData(payload);
          setActiveTab(payload[0].id);
        }, 500);
      } catch (error) {
        console.error("Error fetching results:", error);
        showToastFailed(translate("training_detail_failed_getdetail", language));
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    fetchResults();
  }, [token]);

  const handleDoneTraining = () => {
    const id = f7.views.main.router.currentRoute.params?.id;
    f7.views.main.router.navigate(`/training-detail/${id}/`, { clearPreviousHistory: true });
  };

  if (isLoading) {
    return (
      <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
        <div style={{ padding: "15px", marginBottom: "80px", fontSize: "var(--font-sm)", color: theme === "light" ? "black" : "white" }}>
          <Loading height={"80vh"} />
        </div>
      </Page>
    );
  }

  return (
    <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
      <div style={{ padding: "15px", marginBottom: "80px", fontSize: "var(--font-sm)", color: theme === "light" ? "black" : "white" }}>
        <div style={{ color: theme === "light" ? "black" : "white" }}>
          <p style={{ fontSize: "var(--font-lg)", fontWeight: "600" }}>
            {translate("result_training", language)}
          </p>
        </div>

        <Toolbar top tabbar style={{ background: "none", fontSize: "12px", fontWeight: "700", border: "none" }}>
          {data.map((item) => (
            <Link
              key={item.id}
              tabLink={`#tab-${item.id}`}
              tabLinkActive={activeTab === item.id}
              style={{
                color: activeTab === item.id ? "var(--bg-primary-green)" : "gray",
                borderBottom: activeTab === item.id ? "1px solid var(--bg-primary-green)" : "none",
                width: "100%",
              }}
              onClick={() => setActiveTab(item.id)}
            >
              {item.test_type === "pre_test" ? "Pre-test" : "Post-Test"}
            </Link>
          ))}
        </Toolbar>

        <Tabs swipeable style={{ marginTop: "-20px" }}>
          {data.map((item) => (
            <Tab
              key={`tab-${item.id}`}
              id={`tab-${item.id}`}
              className="page-content"
              tabActive={activeTab === item.id}
            >
              <div style={{ fontSize: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <InfoBlock label={translate("result_training_work_date", language)} value={formatDate(item.submited_at, language)} />
                  <InfoBlock label={translate("result_training_nkm", language)} value={item.passing_grade} />
                </div>
                <ScoreBlock score={item.score} passingGrade={item.passing_grade} />

                {item.results?.map((q, qIndex) => (
                  <QuestionBlock key={q.id} index={qIndex} question={q} theme={theme} />
                ))}
              </div>
            </Tab>
          ))}
        </Tabs>
      </div>

      <ButtonFixBottom needBorderTop={true}>
        <CustomButton
          color={"white"}
          bg={"var(--bg-primary-green)"}
          text={translate("done", language)}
          handleClick={handleDoneTraining}
        />
      </ButtonFixBottom>
    </Page>
  );
};

const InfoBlock = ({ label, value }) => (
  <div style={{ fontWeight: "600" }}>
    <p style={{ margin: "10px 0" }}>{label}</p>
    <div style={{ backgroundColor: "#E5E7EB", color: "#6B7280", padding: "2px 10px", borderRadius: "10px", fontWeight: "400" }}>
      <p>{value ? value : "-"}</p>
    </div>
  </div>
);

const ScoreBlock = ({ score, passingGrade }) => {
  const passed = score >= passingGrade;
  return (
    <div style={{
      padding: "15px 10px",
      borderRadius: "12px",
      fontWeight: "700",
      marginTop: "20px",
      backgroundColor: passed ? "#D1FAE5" : "#FEE2E2",
      color: passed ? "var(--color-green)" : "#B91C1C",
      border: `2px solid ${passed ? "var(--color-green)" : "#B91C1C"}`,
    }}>
      {score}
    </div>
  );
};

const QuestionBlock = ({ index, question, theme, language }) => (
  <div>
    <p style={{ fontWeight: "700", marginTop: "60px" }}>Pertanyaan No. {index + 1}</p>
    <div style={{ borderRadius: "8px", marginBottom: "5px", border: "1px solid #9CA3AF" }}>
      {question.question_image_url && <img src={question.question_image_url} alt="Image Question" style={{ width: "100%", height: "300px", objectFit: "contain" }} />}
      <div style={{ padding: "5px 10px" }}>
        <p>{question.question}</p>
      </div>
    </div>

    {question.question_type != "free_text" ? (
      <AnswerOptions options={question.quiz_options} theme={theme} language={language} />
    ) : (
      <div>
        <p style={{ fontWeight: "700", marginTop: "30px" }}>Jawaban No. {index + 1}</p>

        <div style={{ borderRadius: "8px", marginBottom: "5px", border: "1px solid #9CA3AF", padding: "0 10px" }}>
          <p>{question.quiz_answer_text}</p>
        </div>
      </div>
    )}
  </div>
);

const AnswerOptions = ({ options, theme, language }) => (
  <div style={{ marginTop: "10px" }}>
    {options?.length ? (
      options.map((opt, optIndex) => (
        <div key={opt.id} style={{
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "8px",
          border: `2px solid ${opt.is_correct ? "var(--color-green)" : "#9CA3AF"}`,
          backgroundColor: opt.is_correct ? "#D1FAE5" : "transparent",
          color: opt.is_correct ? "var(--color-green)" : (theme == "light" ? "black" : "white"),
        }}>
          <strong>{String.fromCharCode(65 + optIndex)}. </strong>{opt.answer}
        </div>
      ))
    ) : (
      <p style={{ color: "#B91C1C", fontSize: "var(--font-sm)", fontStyle: "italic" }}>{translate('result_training_answer_not_available', language)}</p>
    )}
  </div>
);

export default ResultTraining;