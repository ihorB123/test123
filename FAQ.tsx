import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Search from "@mui/icons-material/Search";
import { Box, ClickAwayListener } from "@mui/material";
import { capitalizeText } from "Shared/Common/Functions";
import useAppForm from "Shared/Common/Hooks/useAppForm";
import { useComponentData } from "Shared/Common/Hooks/useComponentData";
import Divider from "Shared/Mui/Atoms/Divider/Divider";
import Grid from "Shared/Mui/Atoms/Grid/Grid";
import Typography from "Shared/Mui/Atoms/Typography/Typography";
import FaqAccordion from "Shared/Mui/Organisms/FAQ/FaqAccordion/FaqAccordion";
import eventsService from "Shared/Services/eventsService";
import { TFaqDataType } from "Shared/Types/TFaq";
import {
    ChipsContainer,
    Container,
    Content,
    DropdownItem,
    FaqHeading,
    SearchDropdown,
    SearchQuestionsContainer,
    SearchQuestionsField,
    StyledChip,
} from "./FAQ.styled";
import { FAQProps, MatchingQuestion } from "./FAQ.types";
import { useThemeData } from "Shared/Common/Hooks/useThemeData";
import Button from "Shared/Mui/Atoms/Button/Button";
import { ThemeNames } from "Shared/Types/ThemeNames";
import { getPropertiesForTheme } from "Shared/Common/Utils/mui";

import pageLoadUtils from "Shared/Common/Utils/pageLoadUtils";
import featureFlagsService from "Shared/Services/featureFlagsService";
import { isClassicMattressPage } from "Shared/Common/Utils/isClassicMattressPage";
import appConfig from "Shared/Services/appConfig";

export const FAQ: FC<FAQProps> = ({ maxNumOfQuestions, bgcolor, productName, customTitle, hideFilters, footer }) => {
    const [questionGroups, setQuestionGroups] = useState<TFaqDataType[] | undefined>([]);
    const questionsGroupsNames = questionGroups?.map((questionGroup) => questionGroup.subject);
    const [currentQuestionsGroup, setCurrentQuestionsGroup] = useState("");
    const [expandedQuestionGroup, setExpandedQuestionGroup] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [filteredQuestions, setFilteredQuestions] = useState<MatchingQuestion[]>([]);
    const [expandedAccordionIndex, setExpandedAccordionIndex] = useState(0);
    const { isMediumScreen, themeName, palette } = useThemeData();
    const accordionRef = useRef(null);
    const themeBackgroundColors = {
        [ThemeNames.CLOVERLANE]: palette.primary.heavyLight,
        default: palette.secondary.heavyLight,
    };
    const isMPDPRefreshed = featureFlagsService.getBrandFlag("MPDP_REFRESHED");
    const shouldApplyRefreshUpdates = isMPDPRefreshed && isClassicMattressPage() && !appConfig.isCanada();

    const removeSystem = featureFlagsService.getBrandFlag("REMOVE_SYSTEM_LEGAL");

    const defaultBackgroundColor = getPropertiesForTheme(themeBackgroundColors, themeName);

    const { control, watch, resetField } = useAppForm({ defaultValues: { searchText: "" } });
    const searchText = watch("searchText");

    const { componentData } = useComponentData("FAQ") ?? {};
    const content = useMemo(() => componentData?.[productName] || [], [componentData, productName]);

    const currentSubjectQuestionsLength = content?.find((q) => q.subject === currentQuestionsGroup)?.questions.length;
    const showLoadMoreButton = maxNumOfQuestions && currentSubjectQuestionsLength && currentSubjectQuestionsLength > maxNumOfQuestions;

    useEffect(() => {
        if ((!questionGroups || currentQuestionsGroup === "") && content) {
            setQuestionGroups(
                content?.map((item) => ({
                    ...item,
                    questions: maxNumOfQuestions ? item.questions.slice(0, maxNumOfQuestions) : item.questions,
                }))
            );
            setCurrentQuestionsGroup(content?.[0]?.subject ?? "");
        }
    }, [content, currentQuestionsGroup, maxNumOfQuestions, questionGroups]);

    const scrollToView = (index: number) => {
        const questionAccordion = document.querySelector(`#faq-question-${index}-header`);
        if (!questionAccordion) return;
        const { top } = questionAccordion.getBoundingClientRect();
        const yOffset = -160;
        window.scrollTo({ top: top + scrollY + yOffset, behavior: "smooth" });
    };

    const handleTextFieldChange = useCallback(() => {
        const query = searchText;
        if (query === "") {
            setFilteredQuestions([]);
        } else {
            const matchingQuestions = content
                ?.flatMap((group) =>
                    group.questions.map((q, index) => ({
                        question: q.question,
                        group: group.subject,
                        questionIndex: index,
                    }))
                )
                .filter((q) => {
                    return q.question.toLowerCase().includes(query.toLowerCase());
                });

            setFilteredQuestions(matchingQuestions ?? []);
            if (matchingQuestions && currentQuestionIndex < matchingQuestions?.length) {
                setCurrentQuestionIndex(0);
            }
            setDropdownOpen(true);
        }
    }, [currentQuestionIndex, searchText, content]);

    const handleQuestionClick = ({ questionIndex, group }: Omit<MatchingQuestion, "question">) => {
        setCurrentQuestionsGroup(group);
        setExpandedQuestionGroup(questionIndex > 4 ? group : "");
        setFilteredQuestions([]);
        setExpandedAccordionIndex(questionIndex);
        resetField("searchText");
        pageLoadUtils.waitForElement(`faq-question-${questionIndex}-header`).then(() => {
            scrollToView(questionIndex);
        });
    };

    const closeDropdown = () => {
        setDropdownOpen(false);
    };

    const moveUp = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prevState) => prevState - 1);
        }
    };

    const moveDown = () => {
        if (currentQuestionIndex < filteredQuestions.length - 1) {
            setCurrentQuestionIndex((prevState) => prevState + 1);
        }
    };

    const onKeyPressed = (e: KeyboardEvent) => {
        if (e.key == "ArrowUp") {
            moveUp();
        } else if (e.key == "ArrowDown") {
            moveDown();
        } else if (e.key === "Enter") {
            const { questionIndex, group } = filteredQuestions[currentQuestionIndex];
            handleQuestionClick({ questionIndex, group });
        }
    };

    const expandAccordion = (accordionIndex: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        if (expandedAccordionIndex === accordionIndex) {
            setTimeout(scrollToView, 300, 0);
            return setExpandedAccordionIndex(0);
        }

        const index = isExpanded ? accordionIndex : 0;
        setExpandedAccordionIndex(index);
        setTimeout(scrollToView, 300, index);

        const currentQuestionGroup = questionGroups?.find((q) => q.subject === currentQuestionsGroup);
        const selectedQuestion = currentQuestionGroup?.questions[accordionIndex];

        eventsService.addToDataLayer({
            event: "userInteraction",
            event_name: "questions",
            element_id: "expand",
            click_text: selectedQuestion?.question,
        });
    };

    const handleGroupChange = (group: string) => {
        setCurrentQuestionsGroup(group);
        setExpandedAccordionIndex(0);
        setExpandedQuestionGroup("");

        eventsService.addToDataLayer({
            event: "userInteraction",
            element_id: "filter_by",
            event_name: "questions",
            click_text: capitalizeText(group),
        });
    };

    const handleNoResultsItemClick = () => {
        setFilteredQuestions([]);
    };

    const toggleQuestionGroupExpansion = (isExpanded: boolean) => () => {
        if (!isExpanded) {
            scrollToView(0);

            if (maxNumOfQuestions && expandedAccordionIndex + 1 > maxNumOfQuestions) setExpandedAccordionIndex(0);
        }

        setExpandedQuestionGroup(isExpanded ? currentQuestionsGroup : "");
    };

    useEffect(() => {
        handleTextFieldChange();
    }, [searchText, handleTextFieldChange]);

    return (
        <Container bgcolor={bgcolor || defaultBackgroundColor}>
            <Content>
                {customTitle ? (
                    <Typography
                        mx="auto"
                        mb={{ xs: 6, md: 10 }}
                        color="secondary.main"
                        align="center"
                        variant={isMediumScreen ? "h1" : "h2"}
                        component="h2"
                    >
                        {customTitle}
                    </Typography>
                ) : (
                    <FaqHeading color="secondary.main" align="center" variant={isMediumScreen ? "h1" : "h2"} component="h2">
                        Got questions? {(shouldApplyRefreshUpdates ? isMediumScreen : true) && "We\u0027ve got answers."}
                    </FaqHeading>
                )}
                {!hideFilters && (
                    <ClickAwayListener onClickAway={closeDropdown}>
                        <Box position="relative">
                            <SearchQuestionsContainer>
                                <SearchQuestionsField
                                    name="searchText"
                                    control={control}
                                    label="What can we help you with?"
                                    value={searchText}
                                    iconAfter={<Search />}
                                    onKeyDown={onKeyPressed}
                                />
                            </SearchQuestionsContainer>

                            {dropdownOpen && (
                                <>
                                    {filteredQuestions?.length > 0 ? (
                                        <SearchDropdown>
                                            {filteredQuestions.map(
                                                ({ question, questionIndex, group }: MatchingQuestion, index: number) => {
                                                    return (
                                                        <DropdownItem
                                                            key={index}
                                                            onClick={() => handleQuestionClick({ questionIndex, group })}
                                                        >
                                                            <Typography variant="body3regular">{question}</Typography>
                                                        </DropdownItem>
                                                    );
                                                }
                                            )}
                                        </SearchDropdown>
                                    ) : (
                                        searchText && (
                                            <SearchDropdown>
                                                <DropdownItem onClick={handleNoResultsItemClick}>
                                                    <Typography variant="body3regular">
                                                        No results found. Please try your search again.
                                                    </Typography>
                                                </DropdownItem>
                                            </SearchDropdown>
                                        )
                                    )}
                                </>
                            )}
                        </Box>
                    </ClickAwayListener>
                )}

                <Grid container>
                    {!hideFilters && (
                        <Grid item xs={12} lg={6}>
                            <Box>
                                <Typography variant="body3bold" color="secondary.heavy">
                                    Filter by
                                </Typography>

                                <ChipsContainer>
                                    {questionsGroupsNames?.map((group, index) => {
                                        return (
                                            <StyledChip
                                                key={index}
                                                selected={currentQuestionsGroup === group}
                                                onClick={() => handleGroupChange(group)}
                                            >
                                                {group.toLowerCase()}
                                            </StyledChip>
                                        );
                                    })}
                                </ChipsContainer>
                            </Box>
                        </Grid>
                    )}

                    <Grid item xs={12} lg={hideFilters ? 12 : 6}>
                        <Divider />
                        {questionsGroupsNames?.map((group) => {
                            if (currentQuestionsGroup === group) {
                                const renderedQuestionGroups = currentQuestionsGroup === expandedQuestionGroup ? content : questionGroups;
                                const currentQuestionGroup = renderedQuestionGroups?.find((q) => q.subject === group);

                                return currentQuestionGroup?.questions.map(({ question, answer, answerAlt }, index) => {
                                    const isExpanded = expandedAccordionIndex === index;
                                    return (
                                        <FaqAccordion
                                            key={index}
                                            expandAccordion={expandAccordion}
                                            isExpanded={isExpanded}
                                            answer={removeSystem ? answerAlt || answer : answer}
                                            index={index}
                                            question={question}
                                            accordionRef={accordionRef}
                                        />
                                    );
                                });
                            }

                            return null;
                        })}
                        {showLoadMoreButton && (
                            <Box textAlign="center" mt={2}>
                                <Button variant="primary" onClick={toggleQuestionGroupExpansion(!expandedQuestionGroup)}>
                                    {expandedQuestionGroup ? "Show Less" : "Load more"}
                                </Button>
                            </Box>
                        )}
                        {footer}
                    </Grid>
                </Grid>
            </Content>
        </Container>
    );
};

export default FAQ;
