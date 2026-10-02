import { ToolRegistry } from './tool-registry.js';
import { getBusinessInfoTool } from '../definitions/business-info.tool.js';
import { searchProductsTool, getProductDetailsTool } from '../definitions/catalog.tools.js';
import { calculateOrderTool, createOrderTool } from '../definitions/order.tools.js';
import { transferToHumanTool } from '../definitions/handoff.tool.js';

export function registerDefaultTools(registry?: ToolRegistry): ToolRegistry {
  const reg = registry || ToolRegistry.getInstance();

  reg.register(getBusinessInfoTool);
  reg.register(searchProductsTool);
  reg.register(getProductDetailsTool);
  reg.register(calculateOrderTool);
  reg.register(createOrderTool);
  reg.register(transferToHumanTool);

  return reg;
}
