"""Multi-agent system for ClassroomAI - coordinated agents using OpenAI"""
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class Agent:
    def __init__(self, role: str, goal: str):
        self.role = role
        self.goal = goal
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def execute(self, task: str) -> str:
        """Execute task using OpenAI"""
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"You are a {self.role}. Your goal: {self.goal}"},
                {"role": "user", "content": task}
            ],
            max_tokens=1500,
            temperature=0.7
        )
        return response.choices[0].message.content

def generate_classroom_resources(topic: str, grade_level: str) -> dict:
    """Coordinate multiple agents to generate complete classroom resources"""

    # Define agents
    worksheet_agent = Agent("Worksheet Generator", "Create engaging educational worksheets")
    lesson_agent = Agent("Lesson Planner", "Design comprehensive lesson plans")
    assessment_agent = Agent("Assessment Creator", "Create evaluations and rubrics")

    # Worksheet task
    worksheet_prompt = f"Create a worksheet for {topic} at {grade_level} level with 10 questions and an answer key"
    worksheet = worksheet_agent.execute(worksheet_prompt)

    # Lesson plan task
    lesson_prompt = f"Create a 45-minute lesson plan for {topic} at {grade_level}"
    lesson = lesson_agent.execute(lesson_prompt)

    # Assessment task
    assessment_prompt = f"Create a quiz for {topic} with 5 questions and scoring rubric"
    assessment = assessment_agent.execute(assessment_prompt)

    return {
        "worksheet": worksheet,
        "lesson_plan": lesson,
        "assessment": assessment
    }
