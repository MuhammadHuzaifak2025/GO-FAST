import sequelize from "../../database/index.js";
import asynchandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ErrorHandling.js";
import ApiResponse from "../../utils/ResponseHandling.js";
import { QueryTypes } from "sequelize";

const create_Transport_Manager = asynchandler(async (req, res, next) => {
    try {
        const { name, email, account_no } = req.body;
        let owner = req.user.user_id;

        if (!name || !email || !account_no || !owner) {
            return next(new ApiError(401, "All fields are required"));
        }


        const [get_owner] = await sequelize.query(
            `SELECT * FROM Users a left join "transport_organizations" b on a.user_id = b.owner  WHERE user_id = :owner`, {
            replacements: { owner },
            type: QueryTypes.SELECT
        });

        console.log(get_owner);

        if (!get_owner || get_owner.length === 0) {
            return next(new ApiError(401, "Owner does not exist"));
        }


        if (get_owner.admin === false) {
            return next(new ApiError(401, "Owner is not an admin"));
        }

        if (get_owner.organization_id) {
            return next(new ApiError(401, "Owner is already a transport manager"));
        }

        await sequelize.query(
            `INSERT INTO Transport_Organizations (organization_name, organization_email, bank_account_no, owner, "createdAt", "updatedAt") 
            VALUES (:name, :email, :account_no, :owner, :createdAt, :updatedAt)`, {
            replacements: { name, email, account_no, owner, createdAt: new Date(), updatedAt: new Date() },
            type: QueryTypes.INSERT
        });

        return res.status(201).json({
            message: "Transport Manager created successfully",
        });

    } catch (error) {

        next(error);
    }
});

const update_Transport_Manager = asynchandler(async (req, res, next) => {
    try {
        let { name, email, account_no } = req.body;
        const { organization_id } = req.params;

        if (!organization_id) {
            return next(new ApiError(401, "Organization ID is required"));
        }
        const [get_organization] = await sequelize.query(
            `SELECT * FROM Transport_Organizations WHERE organization_id = :organization_id`, {
            replacements: { organization_id },
            type: QueryTypes.SELECT
        });

        if (!get_organization || get_organization.length === 0) {
            return next(new ApiError(401, "Organization does not exist"));
        }
        if (!name) {
            name = get_organization.organization_name;
        }
        if (!email) {
            email = get_organization.organization_email;
        }
        if (!account_no) {
            account_no = get_organization.bank_account_no;
        }
        await sequelize.query(
            `UPDATE "Transport_Organizations" SET organization_name = :name, organization_email = :email, bank_account_no = :account_no,
            "updatedAt" = :updatedAt WHERE organization_id = :organization_id`, {
            replacements: { name, email, account_no, updatedAt: new Date(), organization_id },
            type: QueryTypes.UPDATE
        });
        return res.status(201).json(new ApiResponse(201, "Organization updated successfully"));
    } catch (error) {
        next(error);
    }
});

const Get_Transport_Manager = asynchandler(async (req, res, next) => {
    try {
        const { organization_id } = req.params;
        if (!organization_id) {
            return next(new ApiError(401, "Organization ID is required"));
        }
        const [select_org] = await sequelize.query(
            `SELECT * FROM Transport_Organizations WHERE organization_id = :organization_id`, {
            replacements: { organization_id },
            type: QueryTypes.SELECT
        });
        if (!select_org) {
            return next(new ApiError(401, "Organization does not exist"));
        }
        return res.status(200).json(new ApiResponse(
            201,
            ["Organization retrieved successfully",
                select_org]
        ));
    } catch (error) {
        next(error);
    }
});


export { create_Transport_Manager, update_Transport_Manager, Get_Transport_Manager };