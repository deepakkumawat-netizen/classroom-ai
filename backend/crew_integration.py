"""Multi-agent crew integration for ClassroomAI"""
from crew import generate_classroom_resources

def handle_multi_agent_request(topic: str, grade_level: str) -> dict:
    """Handle multi-agent crew request for classroom resources"""
    try:
        result = generate_classroom_resources(topic, grade_level)
        return {
            "status": "success",
            "worksheet": result["worksheet"],
            "lesson_plan": result["lesson_plan"],
            "assessment": result["assessment"],
            "agents_used": ["worksheet_generator", "lesson_planner", "assessment_creator"]
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "agents_used": []
        }
