import logging
import os

from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool

from . import prompt
from .sub_agents.agri_analyzer_agent.agri_analyzer_agent import agri_analyzer_agent
from .sub_agents.crop_suitability_agent.crop_suitability_agent import crop_suitability_agent
from .sub_agents.grow_anyways_agent.grow_anyways_agent import grow_anyways_agent
from .sub_agents.yield_improvement_agent.yield_improvement_agent import yield_improvement_agent
from .sub_agents.image_generator_agent.image_generator_agent import image_generator_agent
from .sub_agents.seed_identifier_agent.seed_identifier_agent import seed_identifier_agent
# Set logging
logger = logging.getLogger(__name__)

# Configuration constants
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
DESCRIPTION = "Friendly farming assistant that helps farmers with crop cultivation decisions by collecting crop and location information, validating supported crops, and delegating to agricultural analysis tools"

# --- Director Agent (root agent) ---

if agri_analyzer_agent:
    root_agent = LlmAgent(
        name="Pungde",
        model=GEMINI_MODEL, 
        description=(DESCRIPTION),
        instruction=prompt.PUNGDE_AGENT_PROMPT,
        tools=[AgentTool(agri_analyzer_agent), AgentTool(crop_suitability_agent), AgentTool(grow_anyways_agent), AgentTool(yield_improvement_agent), AgentTool(image_generator_agent), AgentTool(seed_identifier_agent)],
    )
    logger.info(f"✅ Agent '{root_agent.name}' created using model '{GEMINI_MODEL}'.")
else:
    logger.error(
        "❌ Cannot create root agent because one or more sub-agents failed to initialize or a tool is missing."
    )